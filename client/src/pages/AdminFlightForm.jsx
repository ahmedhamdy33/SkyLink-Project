import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import AdminNav from '../components/AdminNav.jsx';
import { usePreferences } from '../context/PreferencesContext.jsx';

const blankFlight = {
  flightCode: '',
  airlineId: '',
  aircraftId: '',
  departureAirportId: '',
  arrivalAirportId: '',
  departureTime: '',
  arrivalTime: '',
  price: '',
  availableSeats: '',
  firstSeats: 0,
  businessSeats: 0,
  premiumEconomySeats: 0,
  economySeats: '',
  status: 'active',
  discountValue: 0,
  discountType: '',
  discountCode: '',
  isDirect: true,
  transitStops: []
};

function toDateTimeLocal(value) {
  if (!value) return '';
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function mapFlightToForm(flight) {
  return {
    flightCode: flight.flight_code,
    airlineId: flight.airline_id,
    aircraftId: flight.aircraft_id,
    departureAirportId: flight.departure_airport_id,
    arrivalAirportId: flight.arrival_airport_id,
    departureTime: toDateTimeLocal(flight.departure_time),
    arrivalTime: toDateTimeLocal(flight.arrival_time),
    price: flight.price,
    availableSeats: flight.available_seats,
    firstSeats: flight.first_seats || 0,
    businessSeats: flight.business_seats || 0,
    premiumEconomySeats: flight.premium_economy_seats || 0,
    economySeats:
      Number(flight.first_seats || 0) + Number(flight.business_seats || 0) + Number(flight.premium_economy_seats || 0) + Number(flight.economy_seats || 0) === 0
        ? flight.available_seats
        : flight.economy_seats ?? flight.available_seats ?? '',
    status: flight.status,
    discountValue: flight.discount_value || 0,
    discountType: flight.discount_type || '',
    discountCode: flight.discount_code || '',
    isDirect: flight.is_direct !== false && flight.is_direct !== 0,
    transitStops: (flight.transit_stops || []).map((stop) => ({
      airportCode: stop.airport_code || '',
      airportName: stop.airport_name || '',
      arrivalTime: toDateTimeLocal(stop.arrival_time),
      departureTime: toDateTimeLocal(stop.departure_time),
      layoverMinutes: stop.layover_minutes || '',
      stopOrder: stop.stop_order || 1
    }))
  };
}

function calculateLayoverMinutes(arrivalTime, departureTime) {
  const diff = new Date(departureTime).getTime() - new Date(arrivalTime).getTime();
  return Number.isFinite(diff) && diff > 0 ? Math.round(diff / 60000) : '';
}

function createBlankStop(order = 1) {
  return {
    airportCode: '',
    airportName: '',
    arrivalTime: '',
    departureTime: '',
    layoverMinutes: '',
    stopOrder: order
  };
}

export default function AdminFlightForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = usePreferences();
  const editingId = id ? Number(id) : null;
  const [meta, setMeta] = useState({ airports: [], airlines: [], aircraft: [] });
  const [form, setForm] = useState(blankFlight);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const aircraftForAirline = useMemo(
    () => meta.aircraft.filter((item) => !form.airlineId || item.airline_id === Number(form.airlineId)),
    [meta.aircraft, form.airlineId]
  );
  const selectedAircraft = meta.aircraft.find((item) => Number(item.aircraft_id) === Number(form.aircraftId));
  const cabinTotal =
    Number(form.firstSeats || 0) + Number(form.businessSeats || 0) + Number(form.premiumEconomySeats || 0) + Number(form.economySeats || 0);

  function updateCabinCount(key, value) {
    const nextValue = Math.max(0, Number(value || 0));
    setForm((current) => ({
      ...current,
      [key]: nextValue,
      availableSeats:
        key === 'firstSeats'
          ? nextValue + Number(current.businessSeats || 0) + Number(current.economySeats || 0)
          : key === 'businessSeats'
            ? Number(current.firstSeats || 0) + nextValue + Number(current.economySeats || 0)
            : Number(current.firstSeats || 0) + Number(current.businessSeats || 0) + nextValue
    }));
  }

  function handleAircraftChange(value) {
    const aircraft = meta.aircraft.find((item) => Number(item.aircraft_id) === Number(value));
    setForm((current) => ({
      ...current,
      aircraftId: value,
      firstSeats: aircraft?.first_seats || 0,
      businessSeats: aircraft?.business_seats || 0,
      premiumEconomySeats: aircraft?.premium_economy_seats || 0,
      economySeats: aircraft?.economy_seats ?? aircraft?.total_seats ?? '',
      availableSeats: aircraft?.total_seats || ''
    }));
  }

  function setTransitMode(isDirect) {
    setForm((current) => ({
      ...current,
      isDirect,
      transitStops: isDirect ? [] : current.transitStops.length ? current.transitStops : [createBlankStop(1)]
    }));
  }

  function updateTransitStop(index, key, value) {
    setForm((current) => {
      const nextStops = current.transitStops.map((stop, stopIndex) => {
        if (stopIndex !== index) return stop;

        const nextStop = { ...stop, [key]: value };
        if (key === 'airportCode') {
          const airport = meta.airports.find((item) => item.airport_code === value);
          nextStop.airportName = airport?.airport_name || '';
        }
        if (key === 'arrivalTime' || key === 'departureTime') {
          nextStop.layoverMinutes = calculateLayoverMinutes(nextStop.arrivalTime, nextStop.departureTime);
        }
        return nextStop;
      });

      return {
        ...current,
        transitStops: nextStops.map((stop, stopIndex) => ({ ...stop, stopOrder: stopIndex + 1 }))
      };
    });
  }

  function addTransitStop() {
    setForm((current) => ({
      ...current,
      isDirect: false,
      transitStops: [...current.transitStops, createBlankStop(current.transitStops.length + 1)]
    }));
  }

  function removeTransitStop(index) {
    setForm((current) => ({
      ...current,
      transitStops: current.transitStops
        .filter((_, stopIndex) => stopIndex !== index)
        .map((stop, stopIndex) => ({ ...stop, stopOrder: stopIndex + 1 }))
    }));
  }

  function moveTransitStop(index, direction) {
    setForm((current) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= current.transitStops.length) return current;
      const nextStops = current.transitStops.slice();
      [nextStops[index], nextStops[targetIndex]] = [nextStops[targetIndex], nextStops[index]];
      return {
        ...current,
        transitStops: nextStops.map((stop, stopIndex) => ({ ...stop, stopOrder: stopIndex + 1 }))
      };
    });
  }

  useEffect(() => {
    async function load() {
      try {
        const [referenceData, flights] = await Promise.all([api.getReferenceData(), api.getFlights()]);
        setMeta(referenceData);
        if (editingId) {
          const flight = flights.find((item) => Number(item.flight_id) === editingId);
          if (!flight) throw new Error(t.flightNotFound);
          setForm(mapFlightToForm(flight));
        } else {
          setForm(blankFlight);
        }
      } catch (err) {
        setError(err.message);
      }
    }

    load();
  }, [editingId]);

  async function saveFlight(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    const payload = {
      ...form,
      airlineId: Number(form.airlineId),
      aircraftId: Number(form.aircraftId),
      departureAirportId: Number(form.departureAirportId),
      arrivalAirportId: Number(form.arrivalAirportId),
      price: Number(form.price),
      availableSeats: cabinTotal,
      firstSeats: Number(form.firstSeats || 0),
      businessSeats: Number(form.businessSeats || 0),
      premiumEconomySeats: Number(form.premiumEconomySeats || 0),
      economySeats: Number(form.economySeats || 0),
      discountValue: Number(form.discountValue || 0),
      discountType: form.discountType || null,
      discountCode: form.discountCode || null,
      is_direct: form.isDirect,
      transit_stops: form.isDirect
        ? []
        : form.transitStops.map((stop, index) => ({
            airport_code: stop.airportCode,
            airport_name: stop.airportName || meta.airports.find((airport) => airport.airport_code === stop.airportCode)?.airport_name || '',
            arrival_time: stop.arrivalTime,
            departure_time: stop.departureTime,
            layover_minutes: Number(stop.layoverMinutes || 0),
            stop_order: index + 1
          }))
    };

    try {
      if (editingId) {
        await api.updateFlight(editingId, payload);
        setSuccess(t.flightUpdated);
      } else {
        await api.createFlight(payload);
        setForm(blankFlight);
        setSuccess(t.flightAdded);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="content-section page-top admin-page">
      <div className="page-banner">
        <div>
          <p className="eyebrow">{t.fleetManagement}</p>
          <h1>{editingId ? t.editFlight : t.addFlight}</h1>
          <p className="section-copy">{t.adminFlightFormCopy}</p>
        </div>
        <div className="page-banner-card">
          <span>{t.mode}</span>
          <strong>{editingId ? t.edit : t.add}</strong>
          <p>{editingId ? `${t.flightSingular} #${editingId}` : t.newSchedule}</p>
        </div>
      </div>

      <AdminNav />

      {error && <p className="alert">{error}</p>}
      {success && <p className="success">{success}</p>}

      <form className="admin-form" onSubmit={saveFlight}>
        <div className="form-grid wide-grid">
          <label>
            {t.flightCode}
            <input required value={form.flightCode} onChange={(event) => setForm({ ...form, flightCode: event.target.value })} />
          </label>
          <label>
            {t.airline}
            <select required value={form.airlineId} onChange={(event) => setForm({ ...form, airlineId: event.target.value, aircraftId: '' })}>
              <option value="">{t.airline}</option>
              {meta.airlines.map((airline) => (
                <option key={airline.airline_id} value={airline.airline_id}>
                  {airline.airline_name}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t.aircraft}
            <select required value={form.aircraftId} onChange={(event) => handleAircraftChange(event.target.value)}>
              <option value="">{t.aircraft}</option>
              {aircraftForAirline.map((aircraft) => (
                <option key={aircraft.aircraft_id} value={aircraft.aircraft_id}>
                  {aircraft.model} - {aircraft.aircraft_type} ({aircraft.total_seats})
                </option>
              ))}
            </select>
          </label>
          <label>
            {t.departure}
            <select required value={form.departureAirportId} onChange={(event) => setForm({ ...form, departureAirportId: event.target.value })}>
              <option value="">{t.chooseAirport}</option>
              {meta.airports.map((airport) => (
                <option key={airport.airport_id} value={airport.airport_id}>
                  {airport.airport_code} - {airport.city}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t.arrival}
            <select required value={form.arrivalAirportId} onChange={(event) => setForm({ ...form, arrivalAirportId: event.target.value })}>
              <option value="">{t.chooseAirport}</option>
              {meta.airports.map((airport) => (
                <option key={airport.airport_id} value={airport.airport_id}>
                  {airport.airport_code} - {airport.city}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t.departureTime}
            <input required type="datetime-local" value={form.departureTime} onChange={(event) => setForm({ ...form, departureTime: event.target.value })} />
          </label>
          <label>
            {t.arrivalTime}
            <input required type="datetime-local" value={form.arrivalTime} onChange={(event) => setForm({ ...form, arrivalTime: event.target.value })} />
          </label>
          <label>
            {t.price}
            <input required min="0" type="number" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} />
          </label>
          <label>
            {t.availableSeats}
            <input readOnly value={cabinTotal} />
          </label>
          <label>
            {t.status}
            <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              <option value="active">{t.statusLabels.active}</option>
              <option value="cancelled">{t.statusLabels.cancelled}</option>
              <option value="delayed">{t.statusLabels.delayed}</option>
            </select>
          </label>
          <label>
            {t.discount}
            <input min="0" type="number" value={form.discountValue} onChange={(event) => setForm({ ...form, discountValue: event.target.value })} />
          </label>
          <label>
            {t.discount}
            <select value={form.discountType} onChange={(event) => setForm({ ...form, discountType: event.target.value })}>
              <option value="">{t.none}</option>
              <option value="fixed">{t.fixed}</option>
              <option value="percentage">{t.percentage}</option>
            </select>
          </label>
          <label>
            {t.discountCode}
            <input value={form.discountCode} onChange={(event) => setForm({ ...form, discountCode: event.target.value })} />
          </label>
        </div>
        <div className="transit-panel">
          <div>
            <p className="eyebrow">Route type</p>
            <h2>Direct or transit</h2>
            <p>Transit flights can have unlimited stops. Layovers must be from 45 minutes to 12 hours.</p>
          </div>
          <div className="segmented-control">
            <button type="button" className={form.isDirect ? 'active' : ''} onClick={() => setTransitMode(true)}>
              Direct Flight
            </button>
            <button type="button" className={!form.isDirect ? 'active' : ''} onClick={() => setTransitMode(false)}>
              Transit Flight
            </button>
          </div>

          {!form.isDirect && (
            <div className="transit-stop-list">
              {form.transitStops.map((stop, index) => (
                <article className="transit-stop-editor" key={`${stop.stopOrder}-${index}`}>
                  <div className="transit-stop-editor-head">
                    <strong>Stop {index + 1}</strong>
                    <div className="row-actions compact-actions">
                      <button type="button" className="ghost" disabled={index === 0} onClick={() => moveTransitStop(index, -1)}>
                        Up
                      </button>
                      <button type="button" className="ghost" disabled={index === form.transitStops.length - 1} onClick={() => moveTransitStop(index, 1)}>
                        Down
                      </button>
                      <button type="button" className="ghost" onClick={() => removeTransitStop(index)}>
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="form-grid wide-grid">
                    <label>
                      Airport
                      <select required value={stop.airportCode} onChange={(event) => updateTransitStop(index, 'airportCode', event.target.value)}>
                        <option value="">Choose airport</option>
                        {meta.airports.map((airport) => (
                          <option key={airport.airport_id} value={airport.airport_code}>
                            {airport.airport_code} - {airport.city}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Arrival at stop
                      <input
                        required
                        type="datetime-local"
                        value={stop.arrivalTime}
                        onChange={(event) => updateTransitStop(index, 'arrivalTime', event.target.value)}
                      />
                    </label>
                    <label>
                      Departure from stop
                      <input
                        required
                        type="datetime-local"
                        value={stop.departureTime}
                        onChange={(event) => updateTransitStop(index, 'departureTime', event.target.value)}
                      />
                    </label>
                    <label>
                      Layover minutes
                      <input
                        required
                        min="45"
                        max="720"
                        type="number"
                        value={stop.layoverMinutes}
                        onChange={(event) => updateTransitStop(index, 'layoverMinutes', event.target.value)}
                      />
                    </label>
                  </div>
                </article>
              ))}
              <button type="button" className="secondary" onClick={addTransitStop}>
                Add transit stop
              </button>
            </div>
          )}
        </div>
        <div className="cabin-count-panel">
          <div>
            <p className="eyebrow">Cabin seats</p>
            <h2>Seat distribution</h2>
            <p>
              {selectedAircraft
                ? `${selectedAircraft.model} capacity: ${selectedAircraft.total_seats}. Distribution is defined on the aircraft.`
                : 'Choose an aircraft to assign its cabin classes and seat map.'}
            </p>
          </div>
          <div className="cabin-count-grid">
            <label>
              {t.classTypes.First}
              <input readOnly min="0" type="number" value={form.firstSeats} />
            </label>
            <label>
              {t.classTypes.Business}
              <input readOnly min="0" type="number" value={form.businessSeats} />
            </label>
            <label>
              {t.classTypes['Premium Economy'] || 'Premium Economy'}
              <input readOnly min="0" type="number" value={form.premiumEconomySeats} />
            </label>
            <label>
              {t.classTypes.Economy}
              <input readOnly min="0" type="number" value={form.economySeats} />
            </label>
            <div className="cabin-count-total">
              <span>{t.availableSeats}</span>
              <strong>{cabinTotal}</strong>
            </div>
          </div>
        </div>
        <div className="row-actions">
          <button>{t.save}</button>
          {editingId && (
            <Link className="button secondary" to="/admin/flights">
              {t.backToFlights}
            </Link>
          )}
          {editingId && (
            <button type="button" className="ghost" onClick={() => navigate('/admin/add-flight')}>
              {t.addNewFlight}
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
