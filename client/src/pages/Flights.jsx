import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import BookingModal from '../components/BookingModal.jsx';
import FlightCard from '../components/FlightCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { usePreferences } from '../context/PreferencesContext.jsx';
import { calculatePassengerSubtotal } from '../utils/pricing.js';

function getDurationMinutes(flight) {
  const start = new Date(flight.departure_time).getTime();
  const end = new Date(flight.arrival_time).getTime();
  const diff = end - start;
  return Number.isFinite(diff) && diff > 0 ? Math.round(diff / 60000) : 0;
}

function formatDuration(durationMinutes, t) {
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  return `${hours}${t.hoursShort || 'h'} ${minutes}${t.minutesShort || 'm'}`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function buildBestScore(flight, metrics) {
  const priceScore = metrics.maxPrice === metrics.minPrice ? 0 : (flight.estimated_total - metrics.minPrice) / (metrics.maxPrice - metrics.minPrice);
  const durationScore =
    metrics.maxDuration === metrics.minDuration ? 0 : (flight.duration_minutes - metrics.minDuration) / (metrics.maxDuration - metrics.minDuration);
  const seatScore =
    metrics.maxSeats === metrics.minSeats ? 0 : 1 - (flight.available_seats - metrics.minSeats) / (metrics.maxSeats - metrics.minSeats);
  const statusPenalty = flight.status === 'active' ? 0 : flight.status === 'delayed' ? 0.18 : 0.8;
  const transitPenalty = Number(flight.transit_count || 0) * 0.12 + (Number(flight.total_layover_minutes || 0) / 60) * 0.05;

  return priceScore * 0.45 + durationScore * 0.35 + seatScore * 0.12 + statusPenalty + transitPenalty;
}

const sortModeKeys = ['best', 'cheapest', 'fastest'];

export default function Flights() {
  const [params] = useSearchParams();
  const { user } = useAuth();
  const { t, formatMoney } = usePreferences();
  const [flights, setFlights] = useState([]);
  const [meta, setMeta] = useState({ airports: [], airlines: [] });
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({
    departureAirportId: params.get('departureAirportId') || '',
    arrivalAirportId: params.get('arrivalAirportId') || '',
    departureDate: params.get('departureDate') || '',
    returnDate: params.get('returnDate') || '',
    passengers: params.get('passengers') || '1',
    classType: params.get('classType') || 'Economy',
    tripType: params.get('tripType') || 'oneWay',
    directOnly: params.get('directOnly') || '',
    maxStops: params.get('maxStops') || '',
    maxLayoverTime: params.get('maxLayoverTime') || ''
  });
  const [selectedAirlines, setSelectedAirlines] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
  const [sortMode, setSortMode] = useState('best');
  const [searchHistory, setSearchHistory] = useState([]);
  const [error, setError] = useState('');

  function hasSearchIntent(nextFilters = filters) {
    return Boolean(
      nextFilters.departureAirportId ||
        nextFilters.arrivalAirportId ||
        nextFilters.departureDate ||
        nextFilters.returnDate ||
        nextFilters.classType !== 'Economy' ||
        nextFilters.directOnly ||
        nextFilters.maxStops ||
        nextFilters.maxLayoverTime ||
        Number(nextFilters.passengers || 1) > 1
    );
  }

  async function load(options = {}) {
    const queryFilters = options.filters || filters;
    try {
      setError('');
      const [referenceData, nextFlights] = await Promise.all([api.getReferenceData(), api.getFlights(queryFilters)]);
      setMeta(referenceData);
      setFlights(nextFlights);

      if (user && options.recordHistory && hasSearchIntent(queryFilters)) {
        await api.recordSearchHistory({
          ...queryFilters,
          resultCount: nextFlights.length
        });
        const nextHistory = await api.getSearchHistory({ limit: 6 });
        setSearchHistory(nextHistory);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load({ recordHistory: hasSearchIntent() });
  }, []);

  useEffect(() => {
    if (!user) {
      setSearchHistory([]);
      return;
    }

    api.getSearchHistory({ limit: 6 }).then(setSearchHistory).catch(() => setSearchHistory([]));
  }, [user]);

  const decoratedFlights = useMemo(() => {
    const passengerProfiles = Array.from({ length: Math.max(1, Number(filters.passengers) || 1) }, () => ({
      classType: filters.classType
    }));

    return flights.map((flight) => {
      const durationMinutes = getDurationMinutes(flight);
      return {
        ...flight,
        duration_minutes: durationMinutes,
        duration_label: formatDuration(durationMinutes, t),
        estimated_total: calculatePassengerSubtotal(passengerProfiles, flight.price, filters.tripType)
      };
    });
  }, [filters.classType, filters.passengers, filters.tripType, flights, t]);

  const airlineOptions = useMemo(() => {
    const grouped = new Map();

    decoratedFlights.forEach((flight) => {
      const current = grouped.get(flight.airline_id) || {
        airline_id: flight.airline_id,
        airline_name: flight.airline_name || 'SkyLink partner',
        count: 0,
        minPrice: Number.POSITIVE_INFINITY
      };

      current.count += 1;
      current.minPrice = Math.min(current.minPrice, flight.estimated_total);
      grouped.set(flight.airline_id, current);
    });

    return [...grouped.values()].sort((left, right) => left.airline_name.localeCompare(right.airline_name));
  }, [decoratedFlights]);

  const priceBounds = useMemo(() => {
    if (!decoratedFlights.length) return { min: 0, max: 0 };

    const totals = decoratedFlights.map((flight) => Number(flight.estimated_total || 0));
    return {
      min: Math.floor(Math.min(...totals)),
      max: Math.ceil(Math.max(...totals))
    };
  }, [decoratedFlights]);

  useEffect(() => {
    const airlineIds = airlineOptions.map((item) => item.airline_id);
    setSelectedAirlines((current) => (current.length ? current.filter((id) => airlineIds.includes(id)) : airlineIds));
  }, [airlineOptions]);

  useEffect(() => {
    setPriceRange(priceBounds);
  }, [priceBounds]);

  const filteredFlights = useMemo(() => {
    const currentFlights = decoratedFlights.filter((flight) => {
      const airlineMatch = !airlineOptions.length ? true : selectedAirlines.includes(flight.airline_id);
      const priceMatch = flight.estimated_total >= priceRange.min && flight.estimated_total <= priceRange.max;
      return airlineMatch && priceMatch;
    });

    const metrics = {
      minPrice: Math.min(...currentFlights.map((flight) => flight.estimated_total), priceBounds.min || 0),
      maxPrice: Math.max(...currentFlights.map((flight) => flight.estimated_total), priceBounds.max || 0),
      minDuration: Math.min(...currentFlights.map((flight) => flight.duration_minutes || 0), 0),
      maxDuration: Math.max(...currentFlights.map((flight) => flight.duration_minutes || 0), 0),
      minSeats: Math.min(...currentFlights.map((flight) => Number(flight.available_seats || 0)), 0),
      maxSeats: Math.max(...currentFlights.map((flight) => Number(flight.available_seats || 0)), 0)
    };

    return [...currentFlights].sort((left, right) => {
      if (sortMode === 'cheapest') return left.estimated_total - right.estimated_total;
      if (sortMode === 'fastest') return left.duration_minutes - right.duration_minutes;
      return buildBestScore(left, metrics) - buildBestScore(right, metrics);
    });
  }, [airlineOptions.length, decoratedFlights, priceBounds.max, priceBounds.min, priceRange.max, priceRange.min, selectedAirlines, sortMode]);

  const featuredFlights = useMemo(() => {
    const cheapest = [...filteredFlights].sort((left, right) => left.estimated_total - right.estimated_total)[0];
    const fastest = [...filteredFlights].sort((left, right) => left.duration_minutes - right.duration_minutes)[0];
    const best = filteredFlights[0];

    return {
      best,
      cheapest,
      fastest
    };
  }, [filteredFlights]);

  const activeRouteSummary = useMemo(() => {
    const departure = meta.airports.find((airport) => String(airport.airport_id) === String(filters.departureAirportId));
    const arrival = meta.airports.find((airport) => String(airport.airport_id) === String(filters.arrivalAirportId));

    if (!departure && !arrival) return t.routeAll;
    return `${departure ? `${departure.city} (${departure.airport_code})` : t.anyOrigin} ${t.routeTo} ${
      arrival ? `${arrival.city} (${arrival.airport_code})` : t.anyDestination
    }`;
  }, [filters.arrivalAirportId, filters.departureAirportId, meta.airports, t]);

  function describeAirport(airportId, fallback) {
    const airport = meta.airports.find((item) => Number(item.airport_id) === Number(airportId));
    return airport ? `${airport.city} (${airport.airport_code})` : fallback;
  }

  function applyHistory(entry) {
    const nextFilters = {
      ...filters,
      departureAirportId: entry.departure_airport_id || '',
      arrivalAirportId: entry.arrival_airport_id || '',
      departureDate: entry.departure_date ? String(entry.departure_date).slice(0, 10) : '',
      returnDate: entry.return_date ? String(entry.return_date).slice(0, 10) : '',
      passengers: String(entry.passengers || 1),
      classType: entry.class_type || 'Economy',
      tripType: entry.trip_type || 'oneWay',
      directOnly: '',
      maxStops: '',
      maxLayoverTime: ''
    };

    setFilters(nextFilters);
    load({ filters: nextFilters });
  }

  function toggleAirline(airlineId) {
    setSelectedAirlines((current) =>
      current.includes(airlineId) ? current.filter((item) => item !== airlineId) : [...current, airlineId]
    );
  }

  function setOnlyAirline(airlineId) {
    setSelectedAirlines([airlineId]);
  }

  return (
    <section className="content-section page-top flights-page">
      <div className="page-banner flights-banner">
        <div>
          <p className="eyebrow">{t.flightSearchEyebrow}</p>
          <h1>{t.flights}</h1>
          <p className="section-copy">{t.flightSearchCopy}</p>
        </div>
        <div className="page-banner-card flights-banner-card">
          <span>{t.liveResults}</span>
          <strong>{filteredFlights.length}</strong>
          <p>{activeRouteSummary}</p>
        </div>
      </div>

      <form
        className="toolbar glass-panel flights-toolbar"
        onSubmit={(event) => {
          event.preventDefault();
          load({ recordHistory: true });
        }}
      >
        <label className="flights-filter-field">
          <span>{t.tripType}</span>
          <select
            value={filters.tripType}
            onChange={(event) =>
              setFilters({
                ...filters,
                tripType: event.target.value,
                returnDate: event.target.value === 'oneWay' ? '' : filters.returnDate
              })
            }
          >
            <option value="oneWay">{t.oneWay}</option>
            <option value="roundTrip">{t.roundTrip}</option>
          </select>
        </label>

        <label className="flights-filter-field">
          <span>{t.departure}</span>
          <select value={filters.departureAirportId} onChange={(event) => setFilters({ ...filters, departureAirportId: event.target.value })}>
            <option value="">{t.anyOrigin}</option>
            {meta.airports.map((airport) => (
              <option key={airport.airport_id} value={airport.airport_id}>
                {airport.airport_code} - {airport.city}
              </option>
            ))}
          </select>
        </label>

        <label className="flights-filter-field">
          <span>{t.arrival}</span>
          <select value={filters.arrivalAirportId} onChange={(event) => setFilters({ ...filters, arrivalAirportId: event.target.value })}>
            <option value="">{t.anyDestination}</option>
            {meta.airports.map((airport) => (
              <option key={airport.airport_id} value={airport.airport_id}>
                {airport.airport_code} - {airport.city}
              </option>
            ))}
          </select>
        </label>

        <label className="flights-filter-field">
          <span>{t.depart}</span>
          <input type="date" value={filters.departureDate} onChange={(event) => setFilters({ ...filters, departureDate: event.target.value })} />
        </label>

        {filters.tripType === 'roundTrip' && (
          <label className="flights-filter-field">
            <span>{t.returnDate}</span>
            <input type="date" value={filters.returnDate} onChange={(event) => setFilters({ ...filters, returnDate: event.target.value })} />
          </label>
        )}

        <label className="flights-filter-field">
          <span>{t.travellers}</span>
          <input min="1" max="6" type="number" value={filters.passengers} onChange={(event) => setFilters({ ...filters, passengers: event.target.value })} />
        </label>

        <label className="flights-filter-field">
          <span>{t.cabinClass}</span>
          <select value={filters.classType} onChange={(event) => setFilters({ ...filters, classType: event.target.value })}>
            <option value="Economy">{t.classTypes.Economy}</option>
            <option value="Business">{t.classTypes.Business}</option>
            <option value="First">{t.classTypes.First}</option>
          </select>
        </label>

        <button className="flights-toolbar-button">{t.searchFlights}</button>
      </form>

      {error && <p className="alert">{error}</p>}

      <div className="flights-layout">
        <aside className="flights-sidebar glass-panel">
          <div className="flights-sidebar-section">
            <div className="flights-sidebar-head">
              <h2>Transit filters</h2>
            </div>
            <div className="transit-filter-stack">
              <label className="airline-filter-option transit-direct-toggle">
                <input
                  type="checkbox"
                  checked={String(filters.directOnly).toLowerCase() === 'true'}
                  onChange={(event) => setFilters({ ...filters, directOnly: event.target.checked ? 'true' : '' })}
                />
                <div>
                  <strong>Direct only</strong>
                  <span>Hide flights with transit stops</span>
                </div>
              </label>
              <label>
                Max stops
                <select value={filters.maxStops} onChange={(event) => setFilters({ ...filters, maxStops: event.target.value })}>
                  <option value="">Any</option>
                  <option value="0">Direct</option>
                  <option value="1">1 stop</option>
                  <option value="2">2 stops</option>
                </select>
              </label>
              <label>
                Max layover
                <select value={filters.maxLayoverTime} onChange={(event) => setFilters({ ...filters, maxLayoverTime: event.target.value })}>
                  <option value="">Any</option>
                  <option value="120">2 hours</option>
                  <option value="240">4 hours</option>
                  <option value="480">8 hours</option>
                  <option value="720">12 hours</option>
                </select>
              </label>
              <button type="button" className="secondary" onClick={() => load({ recordHistory: true })}>
                Apply transit filters
              </button>
            </div>
          </div>

          <div className="flights-sidebar-section">
            <div className="flights-sidebar-head">
              <h2>{t.priceRange}</h2>
              <span>
                {formatMoney(priceRange.min)} - {formatMoney(priceRange.max)}
              </span>
            </div>

            <div className="price-range-stack">
              <input
                type="range"
                min={priceBounds.min}
                max={priceBounds.max || 1}
                value={priceRange.min}
                onChange={(event) =>
                  setPriceRange((current) => ({
                    ...current,
                    min: clamp(Number(event.target.value), priceBounds.min, current.max || priceBounds.max)
                  }))
                }
              />
              <input
                type="range"
                min={priceBounds.min}
                max={priceBounds.max || 1}
                value={priceRange.max}
                onChange={(event) =>
                  setPriceRange((current) => ({
                    ...current,
                    max: clamp(Number(event.target.value), current.min || priceBounds.min, priceBounds.max)
                  }))
                }
              />
            </div>

            <div className="price-range-values">
              <span>{t.min} {formatMoney(priceRange.min)}</span>
              <span>{t.max} {formatMoney(priceRange.max)}</span>
            </div>
          </div>

          <div className="flights-sidebar-section">
            <div className="flights-sidebar-head">
              <h2>{t.airlines}</h2>
              <button type="button" className="ghost flights-reset-button" onClick={() => setSelectedAirlines(airlineOptions.map((item) => item.airline_id))}>
                {t.reset}
              </button>
            </div>

            <div className="airline-filter-list">
              {airlineOptions.map((airline) => (
                <div className="airline-filter-row" key={airline.airline_id}>
                  <label className="airline-filter-option">
                    <input
                      type="checkbox"
                      checked={selectedAirlines.includes(airline.airline_id)}
                      onChange={() => toggleAirline(airline.airline_id)}
                    />
                    <div>
                      <strong>{airline.airline_name}</strong>
                      <span>
                        {t.fromPrice} {formatMoney(airline.minPrice)} | {airline.count} {airline.count > 1 ? t.flightPlural : t.flightSingular}
                      </span>
                    </div>
                  </label>
                  <button type="button" className="ghost airline-only-button" onClick={() => setOnlyAirline(airline.airline_id)}>
                    {t.only}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {user && (
            <div className="flights-sidebar-section">
              <div className="flights-sidebar-head">
                <h2>{t.searchHistory || 'Search history'}</h2>
              </div>
              <div className="search-history-list">
                {searchHistory.map((entry) => (
                  <button
                    type="button"
                    className="search-history-item"
                    key={entry.search_id}
                    onClick={() => applyHistory(entry)}
                  >
                    <strong>
                      {describeAirport(entry.departure_airport_id, t.anyOrigin)} {t.routeTo}{' '}
                      {describeAirport(entry.arrival_airport_id, t.anyDestination)}
                    </strong>
                    <span>
                      {t.classTypes[entry.class_type] || entry.class_type} | {entry.result_count} {t.results}
                    </span>
                  </button>
                ))}
                {!searchHistory.length && <p className="empty compact-empty">{t.noSearchHistory || 'Searches you make will appear here.'}</p>}
              </div>
            </div>
          )}
        </aside>

        <div className="flights-results-column">
          <div className="flights-sort-bar">
            {sortModeKeys.map((modeKey) => {
              const featured = featuredFlights[modeKey];
              const mode = {
                key: modeKey,
                title: t[modeKey],
                subtitle: t[`${modeKey}Subtitle`]
              };
              return (
                <button
                  key={mode.key}
                  type="button"
                  className={`flights-sort-card ${sortMode === mode.key ? 'active' : ''}`}
                  onClick={() => setSortMode(mode.key)}
                >
                  <div className="flights-sort-top">
                    <span className="eyebrow">{mode.title}</span>
                    {featured && (
                      <span className="flights-sort-meta">
                        {featured.airline_name} | {featured.flight_code}
                      </span>
                    )}
                  </div>
                  <div className="flights-sort-value">
                    <strong>
                      {featured
                        ? mode.key === 'fastest'
                          ? featured.duration_label
                          : formatMoney(featured.estimated_total)
                        : t.noMatch}
                    </strong>
                  </div>
                  <p>{mode.subtitle}</p>
                </button>
              );
            })}
          </div>

          <div className="flights-results-head">
            <div>
              <h2>{t.availableFlights}</h2>
              <p className="section-copy">{t.resultsCopy}</p>
            </div>
            <span className="flights-results-count">{filteredFlights.length} {filteredFlights.length === 1 ? t.result : t.results}</span>
          </div>

          <div className="card-grid flights-results-grid">
            {filteredFlights.map((flight) => (
              <FlightCard
                key={flight.flight_id}
                flight={flight}
                variant="search"
                onBook={(nextFlight) => {
                  if (!user) window.location.href = '/login';
                  else setSelected(nextFlight);
                }}
              />
            ))}
          </div>

          {!filteredFlights.length && <p className="empty">{t.noFilteredFlights}</p>}
        </div>
      </div>

      {selected && (
        <BookingModal
          flight={selected}
          initialPassengers={Number(filters.passengers || 1)}
          initialClassType={filters.classType}
          initialTripType={filters.tripType}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}
