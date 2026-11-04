"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

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

export default function ShoppingList() {
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState("");
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function restoreItems() {
      try {
        setItems(readItems(window.localStorage.getItem(STORAGE_KEY)));
        setStorageError(false);
      } catch {
        setStorageError(true);
      }
    }

    function syncItems(event: StorageEvent) {
      if (event.storageArea === window.localStorage && (event.key === STORAGE_KEY || event.key === null)) {
        restoreItems();
      }
    }

    restoreItems();
    setReady(true);
    window.addEventListener("storage", syncItems);
    return () => window.removeEventListener("storage", syncItems);
  }, []);

  function saveItems(nextItems: Item[]) {
    setItems(nextItems);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }

  function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!ready || !trimmedName) return;

    const id = crypto.getRandomValues(new Uint32Array(4)).join("-");
    saveItems([...items, { id, name: trimmedName, bought: false }]);
    setName("");
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
                onChange={(event) => {
                  const bought = event.target.checked;
                  saveItems(items.map((entry) => entry.id === item.id ? { ...entry, bought } : entry));
                }}
              />
              <span>{item.name}</span>
            </label>
            <button
              className="remove-button"
              type="button"
              aria-label={`Usuń produkt: ${item.name}`}
              onClick={() => saveItems(items.filter((entry) => entry.id !== item.id))}
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
          <h2 id="list-title">Produkty</h2>
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
          <button className="add-button" type="submit" disabled={!ready || !name.trim()}>
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Dodaj
          </button>
        </form>

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
              <button type="button" onClick={() => saveItems(remainingItems)}>
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
        {storageError ? "Zapis w przeglądarce jest niedostępny." : "Lista zapisuje się w tej przeglądarce."}
      </footer>
    </>
  );
}
