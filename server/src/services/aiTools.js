import { getBookingPolicyByType } from '../data/policyData.js';
import {
  compareFlightsForAssistant,
  loadRecommendationsForUser,
  loadSearchHistoryForUser,
  predictBestBookingTime,
  searchFlightsWithInsights,
  suggestDestinationsFromFlights
} from './flightDataService.js';

export const aiToolDefinitions = [
  {
    type: 'function',
    name: 'searchFlights',
    description: 'Find real SkyLink flights using backend flight data. Use this whenever a user asks for flight recommendations, prices, routes, or budget-based suggestions.',
    parameters: {
      type: 'object',
      properties: {
        departureAirportId: { type: 'number', description: 'Departure airport id when known.' },
        arrivalAirportId: { type: 'number', description: 'Arrival airport id when known.' },
        departure: { type: 'string', description: 'Departure city, airport name, or airport code when the user says it naturally.' },
        arrival: { type: 'string', description: 'Arrival city, airport name, or airport code when the user says it naturally.' },
        departureDate: { type: 'string', description: 'Departure date in YYYY-MM-DD format when known.' },
        passengers: { type: 'number', description: 'Passenger count from 1 to 9.' },
        classType: { type: 'string', enum: ['Economy', 'Business', 'First'], description: 'Requested cabin class.' },
        tripType: { type: 'string', enum: ['oneWay', 'roundTrip'], description: 'Whether the itinerary is one-way or round-trip.' },
        maxBudget: { type: 'number', description: 'Maximum total budget in USD if provided by the user.' },
        sortBy: { type: 'string', enum: ['cheapest', 'earliest', 'fastest'], description: 'How to rank results.' },
        limit: { type: 'number', description: 'Maximum number of results to return.' }
      },
      required: [],
      additionalProperties: false
    }
  },
  {
    type: 'function',
    name: 'compareFlights',
    description: 'Compare real flights side by side. Use after you already know which flights should be compared, or when the user asks for the best option among matching flights.',
    parameters: {
      type: 'object',
      properties: {
        flightIds: {
          type: 'array',
          items: { type: 'number' },
          description: 'Specific flight ids to compare when available.'
        },
        departureAirportId: { type: 'number', description: 'Optional departure airport filter if specific flight ids are not provided.' },
        arrivalAirportId: { type: 'number', description: 'Optional arrival airport filter if specific flight ids are not provided.' },
        departure: { type: 'string', description: 'Departure city, airport name, or airport code.' },
        arrival: { type: 'string', description: 'Arrival city, airport name, or airport code.' },
        departureDate: { type: 'string', description: 'Optional departure date in YYYY-MM-DD format.' },
        passengers: { type: 'number', description: 'Passenger count from 1 to 9.' },
        classType: { type: 'string', enum: ['Economy', 'Business', 'First'], description: 'Requested cabin class.' },
        tripType: { type: 'string', enum: ['oneWay', 'roundTrip'], description: 'Whether the itinerary is one-way or round-trip.' },
        limit: { type: 'number', description: 'Maximum number of flights to compare when searching by criteria.' }
      },
      required: [],
      additionalProperties: false
    }
  },
  {
    type: 'function',
    name: 'getBookingPolicy',
    description: 'Retrieve official booking policy text from the backend. Use this whenever the user asks about cancellation, baggage, refunds, rescheduling, or general policy questions.',
    parameters: {
      type: 'object',
      properties: {
        policyType: {
          type: 'string',
          enum: ['all', 'cancellation', 'baggage', 'refund', 'reschedule'],
          description: 'The policy topic to summarize.'
        }
      },
      required: ['policyType'],
      additionalProperties: false
    }
  },
  {
    type: 'function',
    name: 'suggestDestinations',
    description: 'Suggest travel destinations using real active routes and pricing data. Use for inspiration questions tied to budget, season, or trip length.',
    parameters: {
      type: 'object',
      properties: {
        departureAirportId: { type: 'number', description: 'Preferred departure airport id if known.' },
        departure: { type: 'string', description: 'Preferred departure city, airport name, or airport code.' },
        maxBudget: { type: 'number', description: 'Maximum total budget in USD.' },
        passengers: { type: 'number', description: 'Passenger count from 1 to 9.' },
        classType: { type: 'string', enum: ['Economy', 'Business', 'First'], description: 'Requested cabin class.' },
        tripType: { type: 'string', enum: ['oneWay', 'roundTrip'], description: 'Whether the itinerary is one-way or round-trip.' },
        season: { type: 'string', description: 'Travel season like summer or winter.' },
        durationDays: { type: 'number', description: 'Approximate trip duration in days if provided.' },
        limit: { type: 'number', description: 'Maximum number of destinations to return.' }
      },
      required: [],
      additionalProperties: false
    }
  },
  {
    type: 'function',
    name: 'getPersonalizedRecommendations',
    description: 'Return personalized flight recommendations for the signed-in user using search history, old bookings, preferred destinations, and cabin preferences. Use when the user asks what SkyLink AI recommends for them personally.',
    parameters: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Maximum number of recommendations to return.' }
      },
      required: [],
      additionalProperties: false
    }
  },
  {
    type: 'function',
    name: 'predictBestBookingTime',
    description: 'Estimate whether the user should book now, wait, or monitor. This uses backend logic and must clearly stay within the available placeholder heuristic.',
    parameters: {
      type: 'object',
      properties: {
        departureAirportId: { type: 'number', description: 'Departure airport id when known.' },
        arrivalAirportId: { type: 'number', description: 'Arrival airport id when known.' },
        departure: { type: 'string', description: 'Departure city, airport name, or airport code.' },
        arrival: { type: 'string', description: 'Arrival city, airport name, or airport code.' },
        departureDate: { type: 'string', description: 'Departure date in YYYY-MM-DD format when known.' }
      },
      required: [],
      additionalProperties: false
    }
  }
];

const schemaTypeMap = {
  object: 'OBJECT',
  array: 'ARRAY',
  string: 'STRING',
  number: 'NUMBER',
  integer: 'INTEGER',
  boolean: 'BOOLEAN'
};

function convertSchema(schema) {
  if (!schema || typeof schema !== 'object') return schema;

  const next = { ...schema };

  if (typeof next.type === 'string') {
    next.type = schemaTypeMap[next.type] || next.type;
  }

  if (next.properties && typeof next.properties === 'object') {
    next.properties = Object.fromEntries(
      Object.entries(next.properties).map(([key, value]) => [key, convertSchema(value)])
    );
  }

  if (next.items) {
    next.items = convertSchema(next.items);
  }

  return next;
}

export const geminiFunctionDeclarations = aiToolDefinitions.map(({ type: _type, ...tool }) => ({
  ...tool,
  parameters: convertSchema(tool.parameters)
}));

export async function executeAiTool(name, args = {}, context = {}) {
  switch (name) {
    case 'searchFlights':
      return searchFlightsWithInsights(args);
    case 'compareFlights':
      return compareFlightsForAssistant(args);
    case 'getBookingPolicy':
      return getBookingPolicyByType(args.policyType);
    case 'suggestDestinations':
      return suggestDestinationsFromFlights(args);
    case 'getPersonalizedRecommendations': {
      if (!context.userId) {
        throw new Error('Sign in first so SkyLink can use your search history and bookings.');
      }

      const recommendations = await loadRecommendationsForUser(context.userId);
      const history = await loadSearchHistoryForUser(context.userId, 5);
      return {
        recommendations: recommendations.slice(0, Math.min(Math.max(Number(args.limit || 4), 1), 6)),
        signals: {
          searchesUsed: history.length,
          lastSearch: history[0] || null
        }
      };
    }
    case 'predictBestBookingTime':
      return predictBestBookingTime(args);
    default:
      throw new Error(`Unknown AI tool: ${name}`);
  }
}
