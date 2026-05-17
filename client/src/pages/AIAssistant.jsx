import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, Clock3, Compass, LoaderCircle, Map, MessageSquareText, Plus, SendHorizontal, ShieldCheck, Sparkles, Wallet } from 'lucide-react';
import { api } from '../api/client.js';
import BookingModal from '../components/BookingModal.jsx';
import FlightCard from '../components/FlightCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { usePreferences } from '../context/PreferencesContext.jsx';

function createMessage(role, content, toolResults = []) {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    content,
    toolResults
  };
}

function MessageText({ content }) {
  return content.split('\n').map((line, index) => <p key={`${line}-${index}`}>{line}</p>);
}

function SearchResultsBlock({ result, onBook }) {
  const { t } = usePreferences();

  if (!result?.flights?.length) return <p className="empty">{t.noLiveMatches}</p>;

  return (
    <div className="assistant-embedded-block">
      <div className="assistant-block-head">
        <div>
          <p className="eyebrow">{t.liveMatches}</p>
          <h3>{result.flights.length} {result.flights.length > 1 ? t.flightOptions : t.flightOption}</h3>
        </div>
        <span className="assistant-mini-badge">{result.filters?.sortBy || t.cheapest} {t.ranking}</span>
      </div>
      <div className="assistant-flight-grid">
        {result.flights.map((flight) => (
          <FlightCard key={flight.flight_id} flight={flight} onBook={onBook} />
        ))}
      </div>
    </div>
  );
}

function ComparisonBlock({ result, formatMoney }) {
  const { t } = usePreferences();

  if (!result?.comparedFlights?.length) return null;

  return (
    <div className="assistant-embedded-block">
      <div className="assistant-block-head">
        <div>
          <p className="eyebrow">{t.flightComparison}</p>
          <h3>{t.sideBySide}</h3>
        </div>
      </div>

      <div className="comparison-highlight-row">
        {result.highlights?.cheapestFlightId && <span>{t.cheapestLabel}: #{result.highlights.cheapestFlightId}</span>}
        {result.highlights?.fastestFlightId && <span>{t.fastestLabel}: #{result.highlights.fastestFlightId}</span>}
        {result.highlights?.bestAvailabilityFlightId && <span>{t.bestSeats}: #{result.highlights.bestAvailabilityFlightId}</span>}
      </div>

      <div className="comparison-table-shell">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>{t.flightSingular}</th>
              <th>{t.route}</th>
              <th>{t.departure}</th>
              <th>{t.totalLabel}</th>
              <th>{t.duration}</th>
              <th>{t.status}</th>
              <th>{t.seats}</th>
            </tr>
          </thead>
          <tbody>
            {result.comparedFlights.map((flight) => (
              <tr key={flight.flight_id}>
                <td>{flight.flight_code}</td>
                <td>{flight.route_label}</td>
                <td>{new Date(flight.departure_time).toLocaleString()}</td>
                <td>{formatMoney(flight.estimated_total || flight.price)}</td>
                <td>{flight.duration_label || 'N/A'}</td>
                <td>
                  <span className={`status ${flight.status}`}>{t.statusLabels[flight.status] || flight.status}</span>
                </td>
                <td>{flight.available_seats}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PolicyBlock({ result }) {
  const { t } = usePreferences();

  if (!result?.policies?.length) return null;

  return (
    <div className="assistant-embedded-block">
      <div className="assistant-block-head">
        <div>
          <p className="eyebrow">{t.officialPolicy}</p>
          <h3>{result.title || t.bookingPolicies}</h3>
        </div>
      </div>

      <div className="assistant-policy-grid">
        {result.policies.map((policy) => (
          <article className="assistant-policy-card" key={policy.key}>
            <h4>{policy.title}</h4>
            <p>{policy.summary}</p>
            <ul>
              {policy.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}

function DestinationsBlock({ result, formatMoney }) {
  const { t } = usePreferences();

  if (!result?.destinations?.length) return null;

  return (
    <div className="assistant-embedded-block">
      <div className="assistant-block-head">
        <div>
          <p className="eyebrow">{t.destinationIdeas}</p>
          <h3>{t.routesWorthConsidering}</h3>
        </div>
      </div>
      <div className="assistant-destination-grid">
        {result.destinations.map((destination) => (
          <article className="assistant-destination-card" key={`${destination.airport_id}-${destination.city}`}>
            {destination.image_url && <img src={destination.image_url} alt={destination.city} />}
            <div className="assistant-destination-copy">
              <p className="eyebrow">{destination.airport_code}</p>
              <h4>{destination.city}</h4>
              <span>{destination.country}</span>
              <strong>{formatMoney(destination.cheapest_flight?.estimated_total || 0)}</strong>
              <p>
                {t.cheapestCurrentRoute}: {destination.cheapest_flight?.flight_code} {t.fromPrice} {destination.cheapest_flight?.departure_code}
              </p>
              <div className="assistant-tag-row">
                {destination.reasons?.map((reason) => (
                  <span key={reason}>{reason}</span>
                ))}
              </div>
              <Link className="button secondary wide" to={`/flights?arrivalAirportId=${destination.airport_id}`}>
                {t.browseFlights}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function PredictionBlock({ result }) {
  const { t } = usePreferences();

  if (!result) return null;

  return (
    <div className="assistant-embedded-block">
      <div className="assistant-block-head">
        <div>
          <p className="eyebrow">{t.bookingTiming}</p>
          <h3>{result.recommendation?.replaceAll('_', ' ') || t.pricingInsight}</h3>
        </div>
        <span className="assistant-mini-badge">{result.confidence || 'heuristic'}</span>
      </div>
      <div className="assistant-prediction-card">
        <p>{result.summary}</p>
        <div className="assistant-tag-row">
          {result.suggested_window && <span>{result.suggested_window}</span>}
          {typeof result.days_until_departure === 'number' && <span>{result.days_until_departure} {t.daysUntilDeparture}</span>}
          <span>{result.data_source || 'backend logic'}</span>
        </div>
        <p className="assistant-note-text">{result.note}</p>
      </div>
    </div>
  );
}

function ToolResults({ toolResults, formatMoney, onBook }) {
  return toolResults.map((tool, index) => {
    if (tool.error) {
      return (
        <div className="assistant-embedded-block" key={`${tool.name}-${index}`}>
          <p className="alert">{tool.error}</p>
        </div>
      );
    }

    if (tool.name === 'searchFlights') return <SearchResultsBlock key={`${tool.name}-${index}`} result={tool.result} onBook={onBook} />;
    if (tool.name === 'compareFlights') return <ComparisonBlock key={`${tool.name}-${index}`} result={tool.result} formatMoney={formatMoney} />;
    if (tool.name === 'getBookingPolicy') return <PolicyBlock key={`${tool.name}-${index}`} result={tool.result} />;
    if (tool.name === 'suggestDestinations') return <DestinationsBlock key={`${tool.name}-${index}`} result={tool.result} formatMoney={formatMoney} />;
    if (tool.name === 'getPersonalizedRecommendations') {
      return (
        <SearchResultsBlock
          key={`${tool.name}-${index}`}
          result={{ flights: tool.result?.recommendations || [], filters: { sortBy: 'personalized' } }}
          onBook={onBook}
        />
      );
    }
    if (tool.name === 'predictBestBookingTime') return <PredictionBlock key={`${tool.name}-${index}`} result={tool.result} />;

    return null;
  });
}

export default function AIAssistant() {
  const { user } = useAuth();
  const { formatMoney, t } = usePreferences();
  const navigate = useNavigate();
  const starterPrompts = useMemo(
    () => [
      { title: t.supportHelp, prompt: t.starterPrompts.supportHelp },
      { title: t.budgetFlight, prompt: t.starterPrompts.budgetFlight },
      { title: t.destinationIdeas, prompt: t.starterPrompts.destinationIdeas },
      { title: t.bookingTiming, prompt: t.starterPrompts.bookingTiming },
      { title: t.personalizedTrips || 'For me', prompt: t.starterPrompts.personalizedTrips },
      { title: t.smartCompare || 'Smart compare', prompt: t.starterPrompts.smartCompare }
    ],
    [t]
  );
  const initialMessages = useMemo(() => [createMessage('assistant', t.assistantGreeting)], [t]);
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [selectedFlight, setSelectedFlight] = useState(null);

  useEffect(() => {
    setMessages((current) =>
      current.length === 1 && current[0].role === 'assistant' ? [createMessage('assistant', t.assistantGreeting)] : current
    );
  }, [t.assistantGreeting]);

  async function sendPrompt(promptText) {
    const nextPrompt = String(promptText || draft).trim();
    if (!nextPrompt || pending) return;

    const userMessage = createMessage('user', nextPrompt);
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setDraft('');
    setError('');
    setPending(true);

    try {
      const response = await api.chatWithAssistant({
        messages: nextMessages.map(({ role, content }) => ({ role, content }))
      });

      setMessages((current) => [...current, createMessage('assistant', response.message, response.toolResults || [])]);
    } catch (requestError) {
      setError(requestError.message || t.assistantError || 'The assistant could not respond right now.');
    } finally {
      setPending(false);
    }
  }

  function handleBook(flight) {
    if (!user) {
      navigate('/login');
      return;
    }

    setSelectedFlight(flight);
  }

  function resetConversation() {
    setMessages(initialMessages);
    setDraft('');
    setError('');
  }

  return (
    <section className="content-section page-top assistant-page assistant-page-chatgpt">
      <div className="assistant-chatgpt-shell">
        <aside className="assistant-sidebar assistant-sidebar-chatgpt glass-panel">
          <button type="button" className="assistant-new-chat secondary" onClick={resetConversation}>
            <Plus size={16} />
            <span>{t.newChat}</span>
          </button>

          <div className="assistant-sidebar-section">
            <p className="eyebrow">{t.quickPrompts}</p>
            <div className="assistant-prompt-grid assistant-prompt-grid-chatgpt">
              {starterPrompts.map((item) => (
                <button key={item.title} className="secondary assistant-starter assistant-starter-chatgpt" onClick={() => sendPrompt(item.prompt)}>
                  <Sparkles size={16} />
                  <span>{item.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="assistant-sidebar-section">
            <p className="eyebrow">{t.capabilities}</p>
            <div className="assistant-capability-list assistant-capability-list-compact">
              <article>
                <MessageSquareText size={18} />
                <div>
                  <strong>{t.customerSupport}</strong>
                  <p>{t.customerSupportCopy}</p>
                </div>
              </article>
              <article>
                <Wallet size={18} />
                <div>
                  <strong>{t.budgetRecommendations}</strong>
                  <p>{t.budgetRecommendationsCopy}</p>
                </div>
              </article>
              <article>
                <Map size={18} />
                <div>
                  <strong>{t.destinationIdeas}</strong>
                  <p>{t.destinationIdeasCopy}</p>
                </div>
              </article>
              <article>
                <Clock3 size={18} />
                <div>
                  <strong>{t.bookingTiming}</strong>
                  <p>{t.bookingTimingCopy}</p>
                </div>
              </article>
            </div>
          </div>

          <div className="assistant-note assistant-note-chatgpt">
            <ShieldCheck size={16} />
            <span>{t.assistantNote}</span>
          </div>
        </aside>

        <div className="assistant-main-panel">
          <div className="assistant-main-head glass-panel">
            <div>
              <p className="eyebrow">SkyLink AI</p>
              <h1>{t.assistant}</h1>
              <p className="section-copy">{t.assistantCopy}</p>
            </div>
            <div className="assistant-head-badges">
              <span>
                <Bot size={16} />
                {t.trustedTools}
              </span>
              <span>
                <Compass size={16} />
                {t.liveContext}
              </span>
            </div>
          </div>

          <div className="assistant-thread assistant-thread-chatgpt glass-panel">
            {messages.length === 1 && (
              <div className="assistant-welcome-block">
                <p className="eyebrow">{t.startHere}</p>
                <h2>{t.helpNextTrip}</h2>
                <p>{t.helpNextTripCopy}</p>
                <div className="assistant-example-grid">
                  {starterPrompts.slice(0, 6).map((item) => (
                    <button type="button" key={item.prompt} className="assistant-example-card" onClick={() => sendPrompt(item.prompt)}>
                      <Sparkles size={16} />
                      <span>{item.prompt}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <article className={`assistant-message ${message.role}`} key={message.id}>
                <div className="assistant-avatar">{message.role === 'assistant' ? <Bot size={16} /> : t.you}</div>
                <div className="assistant-bubble">
                  <MessageText content={message.content} />
                  {message.role === 'assistant' && (
                    <ToolResults toolResults={message.toolResults || []} formatMoney={formatMoney} onBook={handleBook} />
                  )}
                </div>
              </article>
            ))}

            {pending && (
              <article className="assistant-message assistant">
                <div className="assistant-avatar">
                  <Bot size={16} />
                </div>
                <div className="assistant-bubble assistant-loading">
                  <LoaderCircle size={18} className="spin" />
                  <span>{t.loadingAssistant}</span>
                </div>
              </article>
            )}
          </div>

          <form
            className="assistant-composer assistant-composer-chatgpt glass-panel"
            onSubmit={(event) => {
              event.preventDefault();
              sendPrompt();
            }}
          >
            {error && <p className="alert">{error}</p>}
            <label className="assistant-composer-field">
              <span className="eyebrow">{t.messageAssistant}</span>
              <textarea
                rows="4"
                placeholder={t.assistantPlaceholder}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    sendPrompt();
                  }
                }}
              />
            </label>
            <div className="assistant-composer-actions">
              <Link className="button secondary" to="/flights">
                {t.browseFlights}
              </Link>
              <button disabled={pending || !draft.trim()}>
                <SendHorizontal size={16} />
                <span>{pending ? t.thinking : t.send}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {selectedFlight && <BookingModal flight={selectedFlight} onClose={() => setSelectedFlight(null)} />}
    </section>
  );
}
