"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type SeatViewModel = {
  id: number;
  number: number;
  isBlocked: boolean;
};

type SeatPurchasePanelProps = {
  sessionId: number;
  seats: SeatViewModel[];
};

export function SeatPurchasePanel({ sessionId, seats }: SeatPurchasePanelProps) {
  const router = useRouter();
  const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const selectedSeatNumbers = useMemo(() => {
    const byId = new Map(seats.map((seat) => [seat.id, seat.number]));
    return selectedSeatIds.map((id) => byId.get(id)).filter((value): value is number => value !== undefined);
  }, [seats, selectedSeatIds]);

  function toggleSeat(seatId: number, isBlocked: boolean): void {
    if (isBlocked || isSubmitting) {
      return;
    }

    setSelectedSeatIds((current) => {
      if (current.includes(seatId)) {
        return current.filter((id) => id !== seatId);
      }

      return [...current, seatId];
    });
  }

  async function handlePurchase(): Promise<void> {
    setError("");
    setMessage("");

    if (selectedSeatIds.length === 0) {
      setError("Selecione pelo menos um assento disponivel.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: 1,
          sessionId,
          seatIds: selectedSeatIds,
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(body?.message ?? "Nao foi possivel concluir a compra.");
      }

      setMessage("Compra concluida com sucesso.");
      setSelectedSeatIds([]);
      router.refresh();
    } catch (purchaseError) {
      setError(purchaseError instanceof Error ? purchaseError.message : "Erro inesperado ao comprar.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Mapa de assentos</h2>

      <div className="mt-5 grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8">
        {seats.map((seat) => {
          const isSelected = selectedSeatIds.includes(seat.id);

          return (
            <button
              key={seat.id}
              type="button"
              onClick={() => toggleSeat(seat.id, seat.isBlocked)}
              disabled={seat.isBlocked || isSubmitting}
              className={`rounded-lg border px-2 py-3 text-center text-sm font-medium transition ${
                seat.isBlocked
                  ? "cursor-not-allowed border-rose-200 bg-rose-100 text-rose-700"
                  : isSelected
                    ? "border-indigo-300 bg-indigo-100 text-indigo-700"
                    : "border-emerald-200 bg-emerald-100 text-emerald-700 hover:border-emerald-300"
              }`}
              title={seat.isBlocked ? "Assento bloqueado" : "Assento disponivel"}
            >
              {seat.number}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <span className="inline-flex items-center gap-2 text-slate-700">
          <span className="h-3 w-3 rounded-sm bg-emerald-300" aria-hidden />
          Disponivel
        </span>
        <span className="inline-flex items-center gap-2 text-slate-700">
          <span className="h-3 w-3 rounded-sm bg-indigo-300" aria-hidden />
          Selecionado
        </span>
        <span className="inline-flex items-center gap-2 text-slate-700">
          <span className="h-3 w-3 rounded-sm bg-rose-300" aria-hidden />
          Bloqueado (ja possui ticket)
        </span>
      </div>

      <div className="mt-8 grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-3 md:items-end">
        <div className="text-sm text-slate-700 md:col-span-2">
          <p className="font-medium">Assentos selecionados</p>
          <p className="mt-1 text-slate-600">
            {selectedSeatNumbers.length > 0
              ? selectedSeatNumbers.sort((a, b) => a - b).join(", ")
              : "Nenhum assento selecionado"}
          </p>
        </div>

        <button
          type="button"
          onClick={handlePurchase}
          disabled={isSubmitting || selectedSeatIds.length === 0}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSubmitting ? "Processando compra..." : "Comprar assentos"}
        </button>
      </div>

      {message ? <p className="mt-3 text-sm font-medium text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-3 text-sm font-medium text-rose-700">{error}</p> : null}
    </section>
  );
}