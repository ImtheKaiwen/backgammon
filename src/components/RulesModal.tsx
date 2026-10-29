import React from 'react';
import { BookOpen, X } from 'lucide-react';
import type { Language } from '../utils/i18n';
import { translations } from '../utils/i18n';

interface RulesModalProps {
  lang: Language;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ lang, onClose }) => {
  const t = translations[lang];

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: '560px' }}>
        <div className="modal-header-icon badge-info">
          <BookOpen size={32} />
        </div>

        <h2 className="modal-title">{t.gameRulesTitle}</h2>

        <div className="rules-list">
          <div className="rule-item">{t.rule1}</div>
          <div className="rule-item">{t.rule2}</div>
          <div className="rule-item">{t.rule3}</div>
          <div className="rule-item">{t.rule4}</div>
          <div className="rule-item">{t.rule5}</div>
          <div className="rule-item" style={{ borderLeftColor: 'var(--accent-amber)' }}>
            {t.rule6}
          </div>
          <div className="rule-item" style={{ borderLeftColor: 'var(--accent-danger)' }}>
            {t.rule7}
          </div>
        </div>

        <button className="modal-btn-primary" onClick={onClose} style={{ width: '100%' }}>
          <X size={16} style={{ display: 'inline', marginRight: '6px' }} />
          {t.close}
        </button>
      </div>
    </div>
  );
};
