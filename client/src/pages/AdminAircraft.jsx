import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';
import AdminNav from '../components/AdminNav.jsx';
import SeatMap from '../components/SeatMap.jsx';
import { usePreferences } from '../context/PreferencesContext.jsx';

const blankAircraft = {
  airlineId: '',
  model: '',
  aircraftType: 'Narrow-Body',
  totalSeats: 0,
  firstSeats: 0,
  businessSeats: 0,
  premiumEconomySeats: 0,
  economySeats: 0
};

function flattenGroups(groups = []) {
  return groups.flatMap((group) => group.aircraft || []);
}

export default function AdminAircraft() {
  const { t } = usePreferences();
  const [groups, setGroups] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [form, setForm] = useState(blankAircraft);
  const [editingId, setEditingId] = useState(null);
  const [previewSeats, setPreviewSeats] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const aircraft = useMemo(() => flattenGroups(groups), [groups]);
  const classTotal =
    Number(form.firstSeats || 0) +
    Number(form.businessSeats || 0) +
    Number(form.premiumEconomySeats || 0) +
    Number(form.economySeats || 0);

  async function load() {
    const [aircraftGroups, referenceData] = await Promise.all([api.getAircraft(), api.getReferenceData()]);
    setGroups(aircraftGroups);
    setAirlines(referenceData.airlines || []);
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  function updateCount(key, value) {
    const next = Math.max(0, Number(value || 0));
    setForm((current) => {
      const updated = { ...current, [key]: next };
      updated.totalSeats =
        Number(updated.firstSeats || 0) +
        Number(updated.businessSeats || 0) +
        Number(updated.premiumEconomySeats || 0) +
        Number(updated.economySeats || 0);
      return updated;
    });
  }

  async function editAircraft(item) {
    setEditingId(item.aircraft_id);
    setForm({
      airlineId: item.airline_id,
      model: item.model,
      aircraftType: item.aircraft_type,
      totalSeats: item.total_seats,
      firstSeats: item.first_seats || 0,
      businessSeats: item.business_seats || 0,
      premiumEconomySeats: item.premium_economy_seats || 0,
      economySeats: item.economy_seats || 0
    });
    setPreviewSeats(await api.getAircraftSeats(item.aircraft_id).catch(() => []));
  }

  async function saveAircraft(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (classTotal !== Number(form.totalSeats || 0)) {
      setError('Class seat counts must add up to total seats.');
      return;
    }

    try {
      if (editingId) {
        await api.updateAircraft(editingId, form);
        setSuccess('Aircraft updated.');
      } else {
        await api.createAircraft(form);
        setSuccess('Aircraft added.');
      }
      setForm(blankAircraft);
      setEditingId(null);
      setPreviewSeats([]);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeAircraft(id) {
    if (!window.confirm('Delete this aircraft?')) return;
    try {
      await api.deleteAircraft(id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="content-section page-top admin-page">
      <div className="page-banner">
        <div>
          <p className="eyebrow">Fleet</p>
          <h1>Aircraft</h1>
          <p className="section-copy">Define aircraft cabin distributions and generate aircraft-based seat maps.</p>
        </div>
        <div className="page-banner-card">
          <span>Total aircraft</span>
          <strong>{aircraft.length}</strong>
          <p>Narrow-body, wide-body, and regional fleet</p>
        </div>
      </div>

      <AdminNav />

      {error && <p className="alert">{error}</p>}
      {success && <p className="success">{success}</p>}

      <form className="admin-form" onSubmit={saveAircraft}>
        <div className="form-grid wide-grid">
          <label>
            {t.airline}
            <select required value={form.airlineId} onChange={(event) => setForm({ ...form, airlineId: event.target.value })}>
              <option value="">{t.airline}</option>
              {airlines.map((airline) => (
                <option key={airline.airline_id} value={airline.airline_id}>
                  {airline.airline_name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Model
            <input required value={form.model} onChange={(event) => setForm({ ...form, model: event.target.value })} />
          </label>
          <label>
            Type
            <select value={form.aircraftType} onChange={(event) => setForm({ ...form, aircraftType: event.target.value })}>
              <option value="Narrow-Body">Narrow-Body</option>
              <option value="Wide-Body">Wide-Body</option>
              <option value="Regional">Regional</option>
            </select>
          </label>
          <label>
            Total seats
            <input readOnly value={classTotal} />
          </label>
          <label>
            {t.classTypes.First}
            <input min="0" type="number" value={form.firstSeats} onChange={(event) => updateCount('firstSeats', event.target.value)} />
          </label>
          <label>
            {t.classTypes.Business}
            <input min="0" type="number" value={form.businessSeats} onChange={(event) => updateCount('businessSeats', event.target.value)} />
          </label>
          <label>
            {t.classTypes['Premium Economy'] || 'Premium Economy'}
            <input min="0" type="number" value={form.premiumEconomySeats} onChange={(event) => updateCount('premiumEconomySeats', event.target.value)} />
          </label>
          <label>
            {t.classTypes.Economy}
            <input min="0" type="number" value={form.economySeats} onChange={(event) => updateCount('economySeats', event.target.value)} />
          </label>
        </div>
        <div className="row-actions">
          <button>{editingId ? t.save : 'Add aircraft'}</button>
          {editingId && (
            <button
              className="ghost"
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(blankAircraft);
                setPreviewSeats([]);
              }}
            >
              {t.cancel}
            </button>
          )}
        </div>
      </form>

      {previewSeats.length > 0 && (
        <div className="chart-panel aircraft-preview">
          <SeatMap seats={previewSeats} selectedSeats={[]} onToggle={() => {}} />
        </div>
      )}

      {groups.map((group) => (
        <section className="admin-table" key={group.aircraft_type}>
          <div className="section-head">
            <div>
              <p className="eyebrow">Aircraft type</p>
              <h2>{group.aircraft_type}</h2>
            </div>
          </div>
          {(group.aircraft || []).map((item) => (
            <article className="table-row" key={item.aircraft_id}>
              <strong>{item.model}</strong>
              <span>{item.airline_name}</span>
              <span>{item.total_seats} seats</span>
              <span>
                F {item.first_seats || 0} | B {item.business_seats || 0} | PE {item.premium_economy_seats || 0} | E {item.economy_seats || 0}
              </span>
              <div className="row-actions">
                <button className="button" type="button" onClick={() => editAircraft(item)}>
                  {t.edit}
                </button>
                <button className="ghost" type="button" onClick={() => removeAircraft(item.aircraft_id)}>
                  {t.delete}
                </button>
              </div>
            </article>
          ))}
        </section>
      ))}
    </section>
  );
}
