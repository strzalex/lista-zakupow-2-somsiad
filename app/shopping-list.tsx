"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { FormEvent } from "react";
import { changeProduct } from "./products/actions";

type Item = {
  id: string;
  name: string;
  bought: boolean;
};

const STORAGE_KEY = "domowa-lista:zakupy";

function readItems(value: string | null): Item[] {
  if (value === null) return [];

  const items: unknown = JSON.parse(value);
  if (!Array.isArray(items)) throw new Error("Nieprawidłowy format listy");

  return items.filter(
    (item): item is Item =>
      item !== null &&
      typeof item === "object" &&
      typeof item.id === "string" &&
      typeof item.name === "string" &&
      typeof item.bought === "boolean",
  );
}

export default function ShoppingList({
  sharedItems,
  storageKey = STORAGE_KEY,
}: {
  sharedItems?: Item[];
  storageKey?: string;
}) {
  const [localItems, setLocalItems] = useState<Item[]>([]);
  const [name, setName] = useState("");
  const [localReady, setLocalReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [writeError, setWriteError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const input = useRef<HTMLInputElement>(null);
  const shared = sharedItems !== undefined;
  const items = sharedItems ?? localItems;
  const ready = shared || localReady;

  useEffect(() => {
    if (shared) return;

    function restoreItems() {
      try {
        setLocalItems(readItems(window.localStorage.getItem(storageKey)));
        setStorageError(false);
      } catch {
        setStorageError(true);
      }
    }

    function syncItems(event: StorageEvent) {
      if (event.storageArea === window.localStorage && (event.key === storageKey || event.key === null)) {
        restoreItems();
      }
    }

    restoreItems();
    setLocalReady(true);
    window.addEventListener("storage", syncItems);
    return () => window.removeEventListener("storage", syncItems);
  }, [shared, storageKey]);

  function saveItems(nextItems: Item[]) {
    setLocalItems(nextItems);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(nextItems));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }

  function changeItems(change: Parameters<typeof changeProduct>[0], updateLocal: () => Item[]) {
    if (!shared) {
      saveItems(updateLocal());
      if (change.type === "add") setName("");
      return;
    }

    setWriteError(null);
    startTransition(async () => {
      try {
        const error = await changeProduct(change);
        setWriteError(error);
        if (!error && change.type === "add") {
          setName((current) => current.trim() === change.name ? "" : current);
        }
      } catch {
        setWriteError("Nie udało się zapisać zmiany. Odśwież listę, aby sprawdzić jej stan.");
      }
    });
  }

  function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!ready || pending || !trimmedName) return;

    changeItems({ type: "add", name: trimmedName }, () => {
      const id = crypto.getRandomValues(new Uint32Array(4)).join("-");
      return [...items, { id, name: trimmedName, bought: false }];
    });
    input.current?.focus();
  }

  const remainingItems = items.filter((item) => !item.bought);
  const boughtItems = items.filter((item) => item.bought);

  function renderItems(list: Item[], label: string) {
    return (
      <ul className="items" aria-label={label}>
        {list.map((item) => (
          <li className="item" key={item.id}>
            <label className="item-label">
              <input
                type="checkbox"
                checked={item.bought}
                disabled={pending}
                onChange={(event) => {
                  const bought = event.target.checked;
                  changeItems({ type: "toggle", id: item.id, bought }, () => (
                    items.map((entry) => entry.id === item.id ? { ...entry, bought } : entry)
                  ));
                }}
              />
              <span>{item.name}</span>
            </label>
            <button
              className="remove-button"
              type="button"
              disabled={pending}
              aria-label={`Usuń produkt: ${item.name}`}
              onClick={() => changeItems({ type: "remove", id: item.id }, () => (
                items.filter((entry) => entry.id !== item.id)
              ))}
            >
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M4 7h16m-14 0 1 13h10l1-13M9 7V4h6v3m-5 4v5m4-5v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <>
      <section className="list-card" aria-labelledby="list-title">
        <div className="card-header">
          <h2 id="list-title">{shared ? "Wspólna lista rodziny" : "Produkty"}</h2>
          <span className="count" role="status">
            Kupiono {boughtItems.length} z {items.length}
          </span>
        </div>

        <form className="add-form" onSubmit={addItem}>
          <label className="sr-only" htmlFor="product">Nazwa produktu</label>
          <input
            id="product"
            ref={input}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Np. chleb"
            maxLength={120}
            autoComplete="off"
            disabled={!ready}
            required
          />
          <button className="add-button" type="submit" disabled={!ready || pending || !name.trim()}>
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Dodaj
          </button>
        </form>
        {writeError && <p className="auth-error" role="alert">{writeError}</p>}

        {remainingItems.length > 0 ? (
          renderItems(remainingItems, "Do kupienia")
        ) : (
          <div className="empty">
            <div className="empty-icon">
              <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 10h18l-2 9H5l-2-9Zm3 0 4-6m8 6-4-6m-4 9v3m4-3v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3>
              {!ready ? "Wczytywanie listy…" : items.length > 0 ? "Wszystko kupione" : "Lista jest pusta"}
            </h3>
            {ready && items.length === 0 && <p>Dodaj pierwszy produkt, żeby zacząć.</p>}
          </div>
        )}

        {boughtItems.length > 0 && (
          <details className="bought-items">
            <summary>Kupione ({boughtItems.length})</summary>
            {renderItems(boughtItems, "Kupione")}
            <div className="card-actions">
              <button type="button" disabled={pending} onClick={() => (
                changeItems({ type: "clear-bought" }, () => remainingItems)
              )}>
                Usuń kupione
              </button>
            </div>
          </details>
        )}
      </section>

      <footer className={storageError ? "storage-note storage-error" : "storage-note"} role="status">
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="5" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 20h8m-4-3v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        {shared
          ? "Produkty zapisują się we wspólnej bazie Supabase."
          : storageError ? "Zapis w przeglądarce jest niedostępny." : "Lista zapisuje się w tej przeglądarce."}
      </footer>
    </>
  );
}
