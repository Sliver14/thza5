'use client';

import { useState } from 'react';
import { Plus, Trash2, X, AlertCircle } from 'lucide-react';

export default function CustomFieldsBuilder({ fields, onChange }) {
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState('text');
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [newFieldOptions, setNewFieldOptions] = useState('');
  const [error, setError] = useState('');

  const addField = () => {
    setError('');
    if (!newFieldName.trim()) {
      setError('Field label name is required');
      return;
    }

    const key = newFieldName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    // Check if key already exists
    if (fields.some(f => f.key === key)) {
      setError('A field with this name already exists');
      return;
    }

    const newField = {
      key,
      label: newFieldName,
      type: newFieldType,
      required: newFieldRequired,
      options: newFieldType === 'select' 
        ? newFieldOptions.split(',').map(opt => opt.trim()).filter(Boolean)
        : undefined
    };

    onChange([...fields, newField]);
    setNewFieldName('');
    setNewFieldRequired(false);
    setNewFieldOptions('');
  };

  const removeField = (key) => {
    onChange(fields.filter(f => f.key !== key));
  };

  return (
    <div className="bg-card/50 border border-border p-5 rounded-xl space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-foreground/80 mb-1">Custom Program Fields</h4>
        <p className="text-xs text-foreground/50">Add program-specific questions (e.g. Dietary details, Accommodation requests).</p>
      </div>

      {fields.length > 0 && (
        <div className="space-y-2 border-b border-border/50 pb-4">
          {fields.map((field) => (
            <div key={field.key} className="flex items-center justify-between bg-card px-4 py-3 rounded-lg border border-border text-sm">
              <div>
                <span className="font-semibold text-foreground">{field.label}</span>
                <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded uppercase tracking-wider font-semibold">
                  {field.type}
                </span>
                {field.required && (
                  <span className="ml-2 text-xs bg-red-950/40 text-red-200 border border-red-500/20 px-2 py-0.5 rounded font-semibold">
                    Required
                  </span>
                )}
                {field.options && (
                  <div className="text-xs text-foreground/40 mt-1">
                    Options: {field.options.join(', ')}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeField(field.key)}
                className="text-foreground/40 hover:text-red-400 p-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-red-950/40 border border-red-500/20 text-red-200 p-3 rounded-lg text-xs">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-foreground/60">Field Name / Label</label>
          <input
            type="text"
            value={newFieldName}
            onChange={(e) => setNewFieldName(e.target.value)}
            placeholder="e.g. Accommodation"
            className="w-full px-3 py-2 rounded bg-card border border-border text-foreground text-sm focus:outline-none focus:border-primary placeholder-foreground/30"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-foreground/60">Field Type</label>
          <select
            value={newFieldType}
            onChange={(e) => setNewFieldType(e.target.value)}
            className="w-full px-3 py-2 rounded bg-card border border-border text-foreground text-sm focus:outline-none focus:border-primary"
          >
            <option value="text">Text Input</option>
            <option value="select">Dropdown Select</option>
            <option value="boolean">Yes / No Checkbox</option>
          </select>
        </div>

        <div className="flex items-center gap-3 py-2">
          <label className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer">
            <input
              type="checkbox"
              checked={newFieldRequired}
              onChange={(e) => setNewFieldRequired(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary bg-card"
            />
            Required question
          </label>
        </div>
      </div>

      {newFieldType === 'select' && (
        <div className="space-y-1 pt-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-foreground/60">Dropdown Options (Comma separated)</label>
          <input
            type="text"
            value={newFieldOptions}
            onChange={(e) => setNewFieldOptions(e.target.value)}
            placeholder="Yes, No, Maybe"
            className="w-full px-3 py-2 rounded bg-card border border-border text-foreground text-sm focus:outline-none focus:border-primary placeholder-foreground/30"
          />
        </div>
      )}

      <button
        type="button"
        onClick={addField}
        className="w-full md:w-auto px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary-light font-semibold rounded-lg flex items-center justify-center gap-2 text-xs cursor-pointer transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Question Field
      </button>
    </div>
  );
}
