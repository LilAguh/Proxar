import { useState } from 'react';
import {
  useCashRegisterPreview,
  useTodayCashRegister,
  useCashRegisterHistory,
  useCashRegisterById,
  useOpenCashRegister,
  useCloseCashRegister,
  useMovements,
} from '@/hooks/api';
import { Card, Button, Input } from '@presentation/atoms';
import { Spinner, EmptyState } from '@presentation/molecules';
import { CashRegisterStatus, MovementType } from '@core/enums';
import { useUIStore } from '@/stores';
import type { CashRegister } from '@core/entities/CashRegister.entity';
import type { BoxMovement } from '@core/entities/BoxMovement.entity';
import './Caja.scss';

const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });

export const Caja = () => {
  const { openModalCaja } = useUIStore();
  const { data: today, isLoading: loadingToday } = useTodayCashRegister();
  const { data: preview, isLoading: loadingPreview } = useCashRegisterPreview();
  const { data: history, isLoading: loadingHistory } = useCashRegisterHistory();
  const { data: allMovements } = useMovements();
  const openMutation = useOpenCashRegister();
  const closeMutation = useCloseCashRegister();

  const [view, setView] = useState<'today' | 'history' | 'detail'>('today');
  const [selectedRegisterId, setSelectedRegisterId] = useState<string | null>(null);
  const [openingAmounts, setOpeningAmounts] = useState<Record<string, string>>({});
  const [closingAmounts, setClosingAmounts] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');

  const isLoading = loadingToday || loadingPreview;

  const todayDate = today?.date ? new Date(today.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  const todayMovements = (allMovements ?? []).filter((m) => {
    const md = new Date(m.movementDate).toISOString().split('T')[0];
    return md === todayDate;
  });

  const handleOpen = async () => {
    if (!preview) return;
    const entries = preview.accounts.map((acc) => ({
      accountId: acc.accountId,
      openingAmount: parseFloat(openingAmounts[acc.accountId] || '0'),
    }));
    await openMutation.mutateAsync({ entries, notes: notes || undefined });
    setNotes('');
    setOpeningAmounts({});
  };

  const handleClose = async () => {
    if (!today) return;
    const entries = today.entries.map((e) => ({
      accountId: e.accountId,
      closingAmount: parseFloat(closingAmounts[e.accountId] || String(e.openingAmount)),
    }));
    await closeMutation.mutateAsync({ id: today.id, payload: { entries, notes: notes || undefined } });
    setNotes('');
  };

  const initClosingAmounts = () => {
    if (!today) return;
    const initial: Record<string, string> = {};
    today.entries.forEach((e) => {
      initial[e.accountId] = String(e.openingAmount);
    });
    setClosingAmounts(initial);
  };

  const initOpeningAmounts = () => {
    if (!preview) return;
    const initial: Record<string, string> = {};
    preview.accounts.forEach((acc) => {
      initial[acc.accountId] = acc.suggestedAmount != null ? String(acc.suggestedAmount) : '';
    });
    setOpeningAmounts(initial);
  };

  if (isLoading) {
    return <div className="caja-loading"><Spinner size="lg" /></div>;
  }

  return (
    <div className="caja">
      <div className="caja__header">
        <div>
          <h1 className="caja__title">Caja</h1>
          <p className="caja__subtitle">Apertura y cierre diario</p>
        </div>
        <div className="caja__header-tabs">
          <Button variant={view === 'today' ? 'primary' : 'ghost'} size="sm" onClick={() => setView('today')}>
            Hoy
          </Button>
          <Button variant={view === 'history' ? 'primary' : 'ghost'} size="sm" onClick={() => setView('history')}>
            Historial
          </Button>
        </div>
      </div>

      {view === 'today' && (
        <TodayView
          today={today ?? null}
          preview={preview ?? null}
          openingAmounts={openingAmounts}
          closingAmounts={closingAmounts}
          notes={notes}
          movements={todayMovements}
          onOpeningChange={(id, val) => setOpeningAmounts((p) => ({ ...p, [id]: val }))}
          onClosingChange={(id, val) => setClosingAmounts((p) => ({ ...p, [id]: val }))}
          onNotesChange={setNotes}
          onOpen={handleOpen}
          onClose={handleClose}
          onInitClosing={initClosingAmounts}
          onInitOpening={initOpeningAmounts}
          isOpening={openMutation.isPending}
          isClosing={closeMutation.isPending}
          onGoToMovements={openModalCaja}
        />
      )}

      {view === 'history' && (
        <HistoryView
          history={history ?? []}
          isLoading={loadingHistory}
          onSelect={(r) => { setSelectedRegisterId(r.id); setView('detail'); }}
        />
      )}

      {view === 'detail' && selectedRegisterId && (
        <DetailView
          registerId={selectedRegisterId}
          onBack={() => setView('history')}
        />
      )}
    </div>
  );
};

// ─── Sub-components ────────────────────────────────────────────────

interface TodayViewProps {
  today: import('@core/entities/CashRegister.entity').CashRegister | null;
  preview: import('@core/entities/CashRegister.entity').CashRegisterPreview | null;
  openingAmounts: Record<string, string>;
  closingAmounts: Record<string, string>;
  notes: string;
  movements: BoxMovement[];
  onOpeningChange: (id: string, val: string) => void;
  onClosingChange: (id: string, val: string) => void;
  onNotesChange: (val: string) => void;
  onOpen: () => void;
  onClose: () => void;
  onInitClosing: () => void;
  onInitOpening: () => void;
  isOpening: boolean;
  isClosing: boolean;
  onGoToMovements: () => void;
}

const MovementsSection = ({ movements }: { movements: BoxMovement[] }) => {
  if (!movements.length) {
    return (
      <div className="caja__movements-empty">
        <span>Sin movimientos registrados en este período</span>
      </div>
    );
  }

  const income = movements.filter((m) => m.type === MovementType.Income).reduce((s, m) => s + m.amount, 0);
  const expense = movements.filter((m) => m.type === MovementType.Expense).reduce((s, m) => s + m.amount, 0);

  return (
    <div className="caja__movements">
      <div className="caja__movements-summary">
        <span className="caja__movements-income">+{fmt(income)} ingresos</span>
        <span className="caja__movements-expense">-{fmt(expense)} egresos</span>
        <span className="caja__movements-net">Neto: {fmt(income - expense)}</span>
      </div>
      <div className="caja__movements-list">
        {movements.map((m) => (
          <div key={m.id} className={`caja__movement-row caja__movement-row--${m.type === MovementType.Income ? 'income' : 'expense'}`}>
            <span className="caja__movement-number">#{m.number}</span>
            <span className="caja__movement-concept">{m.concept}</span>
            <span className="caja__movement-account">{m.account?.name}</span>
            <span className="caja__movement-amount">
              {m.type === MovementType.Income ? '+' : '-'}{fmt(m.amount)}
            </span>
            <span className="caja__movement-date">
              {new Date(m.movementDate).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const TodayView = ({
  today, preview, openingAmounts, closingAmounts, notes, movements,
  onOpeningChange, onClosingChange, onNotesChange,
  onOpen, onClose, onInitClosing, onInitOpening,
  isOpening, isClosing, onGoToMovements,
}: TodayViewProps) => {

  // Caja ya cerrada hoy
  if (today?.status === CashRegisterStatus.Closed) {
    return (
      <div className="caja__today">
        <Card className="caja__status-card caja__status-card--closed">
          <div className="caja__status-icon">✓</div>
          <h2 className="caja__status-title">Caja cerrada</h2>
          <p className="caja__status-sub">
            Abierta a las {new Date(today.openedAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} por {today.openedByName}
            {today.closedAt && ` · Cerrada a las ${new Date(today.closedAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`}
          </p>
          <div className="caja__entries-grid">
            {today.entries.map((e) => (
              <div key={e.accountId} className="caja__entry-row">
                <span className="caja__entry-name">{e.accountName}</span>
                <span className="caja__entry-open">{fmt(e.openingAmount)}</span>
                <span className="caja__entry-arrow">→</span>
                <span className="caja__entry-close">{e.closingAmount != null ? fmt(e.closingAmount) : '—'}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="caja__movements-title">Movimientos del día</h3>
          <MovementsSection movements={movements} />
        </Card>
      </div>
    );
  }

  // Caja abierta hoy
  if (today?.status === CashRegisterStatus.Open) {
    const allFilled = today.entries.every((e) => closingAmounts[e.accountId] !== undefined);

    if (!allFilled && Object.keys(closingAmounts).length === 0) {
      // Mostrar resumen de apertura con botón para iniciar cierre
      return (
        <div className="caja__today">
          <Card className="caja__status-card caja__status-card--open">
            <div className="caja__status-icon">◎</div>
            <h2 className="caja__status-title">Caja abierta</h2>
            <p className="caja__status-sub">
              Abierta a las {new Date(today.openedAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} por {today.openedByName}
            </p>
            <div className="caja__entries-grid">
              {today.entries.map((e) => (
                <div key={e.accountId} className="caja__entry-row">
                  <span className="caja__entry-name">{e.accountName}</span>
                  <span className="caja__entry-open">{fmt(e.openingAmount)}</span>
                </div>
              ))}
            </div>
            <div className="caja__today-actions">
              <Button variant="ghost" onClick={onGoToMovements}>$ Registrar movimiento</Button>
              <Button variant="danger" onClick={onInitClosing}>Cerrar caja</Button>
            </div>
          </Card>
          <Card>
            <h3 className="caja__movements-title">Movimientos del día</h3>
            <MovementsSection movements={movements} />
          </Card>
        </div>
      );
    }

    // Formulario de cierre
    return (
      <div className="caja__today">
        <Card className="caja__form-card">
          <h2 className="caja__form-title">Cierre de Caja</h2>
          <p className="caja__form-subtitle">Ingresá los saldos con los que cerrás cada cuenta</p>
          <div className="caja__form-grid">
            {today.entries.map((e) => (
              <div key={e.accountId} className="caja__form-row">
                <div className="caja__form-row-header">
                  <span className="caja__form-account">{e.accountName}</span>
                  <span className="caja__form-opened">Apertura: {fmt(e.openingAmount)}</span>
                </div>
                <Input
                  type="number"
                  label="Saldo de cierre"
                  value={closingAmounts[e.accountId] ?? ''}
                  onChange={(v) => onClosingChange(e.accountId, v)}
                  placeholder="0"
                />
              </div>
            ))}
          </div>
          <Input label="Notas (opcional)" value={notes} onChange={onNotesChange} placeholder="Observaciones del cierre..." />
          <div className="caja__form-actions">
            <Button variant="ghost" onClick={() => onClosingChange('__reset__', '')}>Cancelar</Button>
            <Button variant="danger" onClick={onClose} disabled={isClosing}>
              {isClosing ? 'Cerrando...' : 'Confirmar cierre'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // No hay caja abierta hoy
  if (!preview) return null;

  // Discrepancias del día anterior
  const hasDiscrepancies = preview.discrepancies.length > 0;

  if (Object.keys(openingAmounts).length === 0) {
    // Pantalla inicial: muestra discrepancias y botón para abrir
    return (
      <div className="caja__today">
        {hasDiscrepancies && (
          <Card className="caja__discrepancy-card">
            <h3 className="caja__discrepancy-title">⚠️ Diferencias con el cierre anterior</h3>
            <p className="caja__discrepancy-sub">Los saldos actuales no coinciden con el cierre del día anterior</p>
            <div className="caja__discrepancy-list">
              {preview.discrepancies.map((d) => (
                <div key={d.accountId} className="caja__discrepancy-row">
                  <span className="caja__discrepancy-account">{d.accountName}</span>
                  <span className="caja__discrepancy-prev">Cierre anterior: {fmt(d.previousClosingAmount)}</span>
                  <span className="caja__discrepancy-current">Saldo actual: {fmt(d.currentOpeningAmount)}</span>
                  <span className={`caja__discrepancy-diff ${d.difference >= 0 ? 'caja__discrepancy-diff--pos' : 'caja__discrepancy-diff--neg'}`}>
                    {d.difference >= 0 ? '+' : ''}{fmt(d.difference)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className="caja__status-card caja__status-card--idle">
          <div className="caja__status-icon">○</div>
          <h2 className="caja__status-title">Caja no abierta</h2>
          <p className="caja__status-sub">No se registró apertura para hoy todavía</p>
          <Button variant="primary" onClick={onInitOpening}>Abrir caja del día</Button>
        </Card>
      </div>
    );
  }

  // Formulario de apertura
  return (
    <div className="caja__today">
      <Card className="caja__form-card">
        <h2 className="caja__form-title">Apertura de Caja</h2>
        <p className="caja__form-subtitle">Ingresá los saldos con los que abrís cada cuenta</p>
        {preview.discrepancies.length > 0 && (
          <div className="caja__form-alert">
            ⚠️ Hay diferencias con el cierre anterior. Revisalos antes de continuar.
          </div>
        )}
        <div className="caja__form-grid">
          {preview.accounts.map((acc) => (
            <div key={acc.accountId} className="caja__form-row">
              <div className="caja__form-row-header">
                <span className="caja__form-account">{acc.accountName}</span>
                {acc.suggestedAmount != null && (
                  <span className="caja__form-suggested">Cierre anterior: {fmt(acc.suggestedAmount)}</span>
                )}
              </div>
              <Input
                type="number"
                label="Saldo de apertura"
                value={openingAmounts[acc.accountId] ?? ''}
                onChange={(v) => onOpeningChange(acc.accountId, v)}
                placeholder="0"
              />
            </div>
          ))}
        </div>
        <Input label="Notas (opcional)" value={notes} onChange={onNotesChange} placeholder="Observaciones..." />
        <div className="caja__form-actions">
          <Button variant="ghost" onClick={() => {}}>Cancelar</Button>
          <Button variant="primary" onClick={onOpen} disabled={isOpening}>
            {isOpening ? 'Abriendo...' : 'Confirmar apertura'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

interface HistoryViewProps {
  history: CashRegister[];
  isLoading: boolean;
  onSelect: (r: CashRegister) => void;
}

const HistoryView = ({ history, isLoading, onSelect }: HistoryViewProps) => {
  if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}><Spinner size="lg" /></div>;
  if (!history.length) return <EmptyState icon="⬡" title="No hay registros aún" description="Todavía no se registró ninguna apertura de caja" />;

  return (
    <Card className="caja__history">
      <h3 className="caja__history-title">Historial de aperturas</h3>
      <div className="caja__history-list">
        {history.map((r) => {
          const totalOpen = r.entries.reduce((s, e) => s + e.openingAmount, 0);
          const totalClose = r.entries.reduce((s, e) => s + (e.closingAmount ?? 0), 0);
          return (
            <div key={r.id} className="caja__history-item" onClick={() => onSelect(r)}>
              <div className="caja__history-date">{fmtDate(r.date)}</div>
              <div className="caja__history-amounts">
                <span className="caja__history-open">Apertura: {fmt(totalOpen)}</span>
                {r.status === CashRegisterStatus.Closed && (
                  <span className="caja__history-close">Cierre: {fmt(totalClose)}</span>
                )}
              </div>
              <span className={`caja__history-status caja__history-status--${r.status === CashRegisterStatus.Open ? 'open' : 'closed'}`}>
                {r.status === CashRegisterStatus.Open ? 'Abierta' : 'Cerrada'}
              </span>
              <span className="caja__history-arrow">→</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

interface DetailViewProps {
  registerId: string;
  onBack: () => void;
}

const DetailView = ({ registerId, onBack }: DetailViewProps) => {
  const { data: register, isLoading } = useCashRegisterById(registerId);

  if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}><Spinner size="lg" /></div>;
  if (!register) return null;

  const totalOpen = register.entries.reduce((s, e) => s + e.openingAmount, 0);
  const totalClose = register.entries.reduce((s, e) => s + (e.closingAmount ?? 0), 0);

  return (
    <div className="caja__detail">
      <button className="caja__detail-back" onClick={onBack}>← Volver al historial</button>
      <Card className="caja__detail-card">
        <div className="caja__detail-header">
          <h2 className="caja__detail-date">{fmtDate(register.date)}</h2>
          <span className={`caja__history-status caja__history-status--${register.status === CashRegisterStatus.Open ? 'open' : 'closed'}`}>
            {register.status === CashRegisterStatus.Open ? 'Abierta' : 'Cerrada'}
          </span>
        </div>

        <div className="caja__detail-meta">
          <span>Abierta por {register.openedByName} a las {new Date(register.openedAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</span>
          {register.closedAt && (
            <span>Cerrada por {register.closedByName} a las {new Date(register.closedAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</span>
          )}
        </div>

        <div className="caja__detail-entries">
          <div className="caja__detail-entries-header">
            <span>Cuenta</span>
            <span>Apertura</span>
            <span>Cierre</span>
            <span>Diferencia</span>
          </div>
          {register.entries.map((e) => {
            const diff = e.closingAmount != null ? e.closingAmount - e.openingAmount : null;
            return (
              <div key={e.accountId} className="caja__detail-entry-row">
                <span className="caja__entry-name">{e.accountName}</span>
                <span>{fmt(e.openingAmount)}</span>
                <span>{e.closingAmount != null ? fmt(e.closingAmount) : '—'}</span>
                <span className={diff != null ? (diff >= 0 ? 'caja__diff--pos' : 'caja__diff--neg') : ''}>
                  {diff != null ? `${diff >= 0 ? '+' : ''}${fmt(diff)}` : '—'}
                </span>
              </div>
            );
          })}
          <div className="caja__detail-entry-row caja__detail-entry-row--total">
            <span>Total</span>
            <span>{fmt(totalOpen)}</span>
            <span>{register.status === CashRegisterStatus.Closed ? fmt(totalClose) : '—'}</span>
            <span className={totalClose - totalOpen >= 0 ? 'caja__diff--pos' : 'caja__diff--neg'}>
              {register.status === CashRegisterStatus.Closed
                ? `${totalClose - totalOpen >= 0 ? '+' : ''}${fmt(totalClose - totalOpen)}`
                : '—'}
            </span>
          </div>
        </div>

        {register.notes && (
          <div className="caja__detail-notes">
            <strong>Notas:</strong> {register.notes}
          </div>
        )}
      </Card>

      <Card>
        <h3 className="caja__movements-title">Movimientos del día</h3>
        <MovementsSection movements={register.movements ?? []} />
      </Card>
    </div>
  );
};
