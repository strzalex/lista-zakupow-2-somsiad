"use client";

import { useState, useTransition, type FormEvent } from "react";
import { changeProduct } from "../products/actions";
import { suggestGroceries } from "./actions";

export default function MealSuggestions() {
  const [meal, setMeal] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [generating, startGenerating] = useTransition();
  const [adding, startAdding] = useTransition();
  const busy = generating || adding;

  function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !meal.trim()) return;
    setError("");
    setStatus("");
    setSuggestions([]);
    setSelected([]);
    startGenerating(async () => {
      try {
        const result = await suggestGroceries(meal);
        if ("error" in result) {
          setError(result.error);
        } else {
          setSuggestions(result.items);
          setSelected(result.items);
          setStatus(result.items.length ? "Podpowiedzi gotowe. Wybierz, co dodać." : "Podaj nazwę dania albo opisz posiłek.");
        }
      } catch {
        setError("Nie udało się pobrać podpowiedzi AI. Spróbuj ponownie.");
      }
    });
  }

  function addSelected() {
    if (busy || !selected.length) return;
    setError("");
    startAdding(async () => {
      try {
        const message = await changeProduct({ type: "add-many", names: selected });
        if (message) {
          setError(message);
        } else {
          setSuggestions([]);
          setSelected([]);
          setStatus("Wybrane produkty są już na liście.");
        }
      } catch {
        setError("Nie udało się potwierdzić zapisu. Sprawdź listę przed ponowną próbą.");
      }
    });
  }

  return (
    <details className="meal-suggestions">
      <summary>Podpowiedzi zakupowe AI</summary>
      <form className="meal-form" onSubmit={generate}>
        <label htmlFor="meal">Co chcesz zjeść?</label>
        <div className="add-form">
          <input
            id="meal"
            value={meal}
            onChange={(event) => {
              setMeal(event.target.value);
              setSuggestions([]);
              setSelected([]);
              setError("");
              setStatus("");
            }}
            placeholder="Np. tacos dla 4 osób"
            maxLength={400}
            autoComplete="off"
            disabled={busy}
            required
          />
          <button className="add-button" type="submit" disabled={busy || !meal.trim()}>
            Podpowiedz
          </button>
        </div>
      </form>
      <p className="meal-status" role="status">
        {generating ? "AI przygotowuje listę…" : adding ? "Dodawanie produktów…" : status}
      </p>
      {suggestions.length > 0 && (
        <>
          <ul className="items meal-items" aria-label="Proponowane produkty">
            {suggestions.map((name) => (
              <li className="item" key={name}>
                <label className="item-label">
                  <input
                    type="checkbox"
                    checked={selected.includes(name)}
                    disabled={busy}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      setSelected((current) => checked ? [...current, name] : current.filter((entry) => entry !== name));
                    }}
                  />
                  <span>{name}</span>
                </label>
              </li>
            ))}
          </ul>
          <button className="add-button meal-add" type="button" disabled={busy || !selected.length} onClick={addSelected}>
            Dodaj wybrane ({selected.length})
          </button>
        </>
      )}
      {error && <p className="auth-error" role="alert">{error}</p>}
    </details>
  );
}
