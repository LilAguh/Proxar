import { useState } from 'react';
import { Modal } from '@/presentation/molecules/Modal/Modal';
import { useCreateBudget } from '@/hooks/api/useBudgets';
import { budgetRepository } from '@data/repositories/budget.repository';
import { Plus, Trash2, Download } from 'lucide-react';
import './BudgetModal.scss';

interface BudgetItem {
  id: string;
  quantity: number;
  description: string;
  unitPrice: number;
  ivaPercentage: number;
}

interface BudgetModalProps {
  ticketId: string;
  clientName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BudgetModal = ({ ticketId, clientName, onClose, onSuccess }: BudgetModalProps) => {
  const createBudget = useCreateBudget();

  const [items, setItems] = useState<BudgetItem[]>([
    { id: crypto.randomUUID(), quantity: 1, description: '', unitPrice: 0, ivaPercentage: 21 }
  ]);
  const [validDays, setValidDays] = useState(15);
  const [discount, setDiscount] = useState(0);

  // Cálculos automáticos
  const calculateItemSubtotal = (item: BudgetItem) => item.quantity * item.unitPrice;
  const calculateItemIVA = (item: BudgetItem) => {
    const subtotal = calculateItemSubtotal(item);
    return subtotal * (item.ivaPercentage / 100);
  };
  const calculateItemTotal = (item: BudgetItem) => calculateItemSubtotal(item) + calculateItemIVA(item);

  const subtotalBeforeDiscount = items.reduce((sum, item) => sum + calculateItemSubtotal(item), 0);
  const subtotalAfterDiscount = subtotalBeforeDiscount - discount;

  // IVA calculado sobre el subtotal después de descuento
  const totalIVA = items.reduce((sum, item) => {
    const discountRatio = discount > 0 ? discount / subtotalBeforeDiscount : 0;
    const itemDiscountedSubtotal = calculateItemSubtotal(item) * (1 - discountRatio);
    return sum + (itemDiscountedSubtotal * (item.ivaPercentage / 100));
  }, 0);

  const total = subtotalAfterDiscount + totalIVA;

  const addItem = () => {
    setItems([...items, {
      id: crypto.randomUUID(),
      quantity: 1,
      description: '',
      unitPrice: 0,
      ivaPercentage: 21
    }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof BudgetItem, value: any) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSubmit = async () => {
    // Validaciones
    if (items.some(item => !item.description.trim())) {
      alert('Todos los items deben tener una descripción');
      return;
    }

    if (items.some(item => item.quantity <= 0 || item.unitPrice < 0)) {
      alert('Cantidad y precio deben ser válidos');
      return;
    }

    try {
      const budget = await createBudget.mutateAsync({
        ticketId,
        validDays,
        discount,
        items: items.map(item => ({
          quantity: item.quantity,
          description: item.description,
          unitPrice: item.unitPrice,
          ivaPercentage: item.ivaPercentage,
        })),
      });

      // Descargar PDF automáticamente
      const pdfUrl = budgetRepository.getPdfUrl(budget.id);
      window.open(pdfUrl, '_blank');

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error al crear presupuesto:', error);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Nuevo Presupuesto - ${clientName}`}
      width="xl"
      isLoading={createBudget.isPending}
    >
      <div className="budget-modal">
        <div className="budget-modal__config">
          <div className="budget-modal__field">
            <label>Válido por (días)</label>
            <input
              type="number"
              value={validDays}
              onChange={(e) => setValidDays(parseInt(e.target.value) || 0)}
              min="1"
            />
          </div>
          <div className="budget-modal__field">
            <label>Descuento ($)</label>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div className="budget-modal__items">
          <div className="budget-modal__items-header">
            <h3>Items del Presupuesto</h3>
            <button
              type="button"
              className="budget-modal__add-btn"
              onClick={addItem}
            >
              <Plus size={16} />
              Agregar Item
            </button>
          </div>

          <div className="budget-modal__table-wrapper">
            <table className="budget-modal__table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Cant.</th>
                  <th>Descripción</th>
                  <th style={{ width: '100px' }}>% IVA</th>
                  <th style={{ width: '120px' }}>P. Unit.</th>
                  <th style={{ width: '120px' }}>Subtotal</th>
                  <th style={{ width: '100px' }}>IVA</th>
                  <th style={{ width: '120px' }}>Total</th>
                  <th style={{ width: '60px' }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                        min="1"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Descripción del item"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={item.ivaPercentage}
                        onChange={(e) => updateItem(item.id, 'ivaPercentage', parseFloat(e.target.value) || 0)}
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="budget-modal__table-calculated">
                      ${calculateItemSubtotal(item).toFixed(2)}
                    </td>
                    <td className="budget-modal__table-calculated">
                      ${calculateItemIVA(item).toFixed(2)}
                    </td>
                    <td className="budget-modal__table-calculated">
                      ${calculateItemTotal(item).toFixed(2)}
                    </td>
                    <td>
                      {items.length > 1 && (
                        <button
                          type="button"
                          className="budget-modal__delete-btn"
                          onClick={() => removeItem(item.id)}
                          title="Eliminar item"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="budget-modal__totals">
            {discount > 0 && (
              <div className="budget-modal__total-row">
                <span>Subtotal antes de descuento:</span>
                <span>${subtotalBeforeDiscount.toFixed(2)}</span>
              </div>
            )}
            {discount > 0 && (
              <div className="budget-modal__total-row">
                <span>Descuento:</span>
                <span className="budget-modal__discount">- ${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="budget-modal__total-row">
              <span>Subtotal:</span>
              <span>${subtotalAfterDiscount.toFixed(2)}</span>
            </div>
            <div className="budget-modal__total-row">
              <span>IVA:</span>
              <span>${totalIVA.toFixed(2)}</span>
            </div>
            <div className="budget-modal__total-row budget-modal__total-row--final">
              <span>TOTAL:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="budget-modal__actions">
          <button
            type="button"
            className="budget-modal__btn budget-modal__btn--secondary"
            onClick={onClose}
            disabled={createBudget.isPending}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="budget-modal__btn budget-modal__btn--primary"
            onClick={handleSubmit}
            disabled={createBudget.isPending}
          >
            <Download size={16} />
            Crear Presupuesto y Descargar PDF
          </button>
        </div>
      </div>
    </Modal>
  );
};
