export const currencies = [
  { currency_code: 'USD', currency_name: 'US Dollar', symbol: '$', rate_to_usd: 1 },
  { currency_code: 'EGP', currency_name: 'Egyptian Pound', symbol: 'EGP', rate_to_usd: 48.5 },
  { currency_code: 'EUR', currency_name: 'Euro', symbol: '€', rate_to_usd: 0.92 },
  { currency_code: 'GBP', currency_name: 'British Pound', symbol: '£', rate_to_usd: 0.79 }
,
  { currency_code: 'AED', currency_name: 'UAE Dirham', symbol: 'AED', rate_to_usd: 3.67 },
  { currency_code: 'SAR', currency_name: 'Saudi Riyal', symbol: 'SAR', rate_to_usd: 3.75 },
  { currency_code: 'QAR', currency_name: 'Qatari Riyal', symbol: 'QAR', rate_to_usd: 3.64 },
  { currency_code: 'KWD', currency_name: 'Kuwaiti Dinar', symbol: 'KWD', rate_to_usd: 0.31 },
  { currency_code: 'JOD', currency_name: 'Jordanian Dinar', symbol: 'JOD', rate_to_usd: 0.71 }
];

export const airports = [
  {
    airport_id: 1,
    airport_code: 'CAI',
    airport_name: 'Cairo International Airport',
    city: 'Cairo',
    country: 'Egypt',
    image_url: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=900&q=80'
  },
  {
    airport_id: 2,
    airport_code: 'DXB',
    airport_name: 'Dubai International Airport',
    city: 'Dubai',
    country: 'United Arab Emirates',
    image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80'
  },
  {
    airport_id: 3,
    airport_code: 'LHR',
    airport_name: 'Heathrow Airport',
    city: 'London',
    country: 'United Kingdom',
    image_url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=80'
  },
  {
    airport_id: 4,
    airport_code: 'JFK',
    airport_name: 'John F. Kennedy International Airport',
    city: 'New York',
    country: 'United States',
    image_url: 'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=900&q=80'
  },
  {
    airport_id: 5,
    airport_code: 'CDG',
    airport_name: 'Charles de Gaulle Airport',
    city: 'Paris',
    country: 'France',
    image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80'
  },
  {
    airport_id: 6,
    airport_code: 'IST',
    airport_name: 'Istanbul Airport',
    city: 'Istanbul',
    country: 'Turkey',
    image_url: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=900&q=80'
  },
  {
    airport_id: 7,
    airport_code: 'HBE',
    airport_name: 'Borg El Arab Airport',
    city: 'Alexandria',
    country: 'Egypt',
    image_url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=900&q=80'
  },
  {
    airport_id: 8,
    airport_code: 'DOH',
    airport_name: 'Hamad International Airport',
    city: 'Doha',
    country: 'Qatar',
    image_url: 'https://images.unsplash.com/photo-1529074963764-98f45c47344b?auto=format&fit=crop&w=900&q=80'
  },
  {
    airport_id: 9,
    airport_code: 'JED',
    airport_name: 'King Abdulaziz International Airport',
    city: 'Jeddah',
    country: 'Saudi Arabia',
    image_url: 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?auto=format&fit=crop&w=900&q=80'
  },
  {
    airport_id: 10,
    airport_code: 'RUH',
    airport_name: 'King Khalid International Airport',
    city: 'Riyadh',
    country: 'Saudi Arabia',
    image_url: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=900&q=80'
  },
  {
    airport_id: 11,
    airport_code: 'AUH',
    airport_name: 'Zayed International Airport',
    city: 'Abu Dhabi',
    country: 'United Arab Emirates',
    image_url: 'https://images.unsplash.com/photo-1512632578888-169bbbc64f33?auto=format&fit=crop&w=900&q=80'
  },
  {
    airport_id: 12,
    airport_code: 'AMS',
    airport_name: 'Amsterdam Schiphol Airport',
    city: 'Amsterdam',
    country: 'Netherlands',
    image_url: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=900&q=80'
  },
  {
    airport_id: 13,
    airport_code: 'FRA',
    airport_name: 'Frankfurt Airport',
    city: 'Frankfurt',
    country: 'Germany',
    image_url: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=900&q=80'
  },
  {
    airport_id: 14,
    airport_code: 'MAD',
    airport_name: 'Adolfo Suarez Madrid-Barajas Airport',
    city: 'Madrid',
    country: 'Spain',
    image_url: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=900&q=80'
  },
  {
    airport_id: 15,
    airport_code: 'FCO',
    airport_name: 'Leonardo da Vinci-Fiumicino Airport',
    city: 'Rome',
    country: 'Italy',
    image_url: 'https://images.unsplash.com/photo-1525874684015-58379d421a52?auto=format&fit=crop&w=900&q=80'
  },
  {
    airport_id: 16,
    airport_code: 'ATH',
    airport_name: 'Athens International Airport',
    city: 'Athens',
    country: 'Greece',
    image_url: 'https://images.unsplash.com/photo-1503152394-c571994fd383?auto=format&fit=crop&w=900&q=80'
  },
  {
    airport_id: 17,
    airport_code: 'BEY',
    airport_name: 'Beirut Rafic Hariri International Airport',
    city: 'Beirut',
    country: 'Lebanon',
    image_url: 'https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=900&q=80'
  },
  {
    airport_id: 18,
    airport_code: 'AMM',
    airport_name: 'Queen Alia International Airport',
    city: 'Amman',
    country: 'Jordan',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Amman_skyline.jpg'
  },
  {
    airport_id: 19,
    airport_code: 'KWI',
    airport_name: 'Kuwait International Airport',
    city: 'Kuwait City',
    country: 'Kuwait',
    image_url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80'
  },
  {
    airport_id: 20,
    airport_code: 'BAH',
    airport_name: 'Bahrain International Airport',
    city: 'Manama',
    country: 'Bahrain',
    image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80'
  },
  {
    airport_id: 21,
    airport_code: 'MCT',
    airport_name: 'Muscat International Airport',
    city: 'Muscat',
    country: 'Oman',
    image_url: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=900&q=80'
  },
  {
    airport_id: 22,
    airport_code: 'SIN',
    airport_name: 'Singapore Changi Airport',
    city: 'Singapore',
    country: 'Singapore',
    image_url: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=900&q=80'
  },
  {
    airport_id: 23,
    airport_code: 'HND',
    airport_name: 'Tokyo Haneda Airport',
    city: 'Tokyo',
    country: 'Japan',
    image_url: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=900&q=80'
  },
  {
    airport_id: 24,
    airport_code: 'SYD',
    airport_name: 'Sydney Kingsford Smith Airport',
    city: 'Sydney',
    country: 'Australia',
    image_url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=900&q=80'
  },
  {
    airport_id: 25,
    airport_code: 'YYZ',
    airport_name: 'Toronto Pearson International Airport',
    city: 'Toronto',
    country: 'Canada',
    image_url: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?auto=format&fit=crop&w=900&q=80'
  },
  {
    airport_id: 26,
    airport_code: 'CPT',
    airport_name: 'Cape Town International Airport',
    city: 'Cape Town',
    country: 'South Africa',
    image_url: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=900&q=80'
  }
];

export const airlines = [
  { airline_id: 1, airline_name: 'SkyLink Air', country: 'Egypt' },
  { airline_id: 2, airline_name: 'Nile Wings', country: 'Egypt' },
  { airline_id: 3, airline_name: 'Global Jet', country: 'United States' },
  { airline_id: 4, airline_name: 'EgyptAir', country: 'Egypt' },
  { airline_id: 5, airline_name: 'Emirates', country: 'United Arab Emirates' },
  { airline_id: 6, airline_name: 'Qatar Airways', country: 'Qatar' },
  { airline_id: 7, airline_name: 'Etihad Airways', country: 'United Arab Emirates' },
  { airline_id: 8, airline_name: 'Saudia', country: 'Saudi Arabia' },
  { airline_id: 9, airline_name: 'Flynas', country: 'Saudi Arabia' },
  { airline_id: 10, airline_name: 'Gulf Air', country: 'Bahrain' },
  { airline_id: 11, airline_name: 'Oman Air', country: 'Oman' },
  { airline_id: 12, airline_name: 'Royal Jordanian', country: 'Jordan' },
  { airline_id: 13, airline_name: 'Ethiopian Airlines', country: 'Ethiopia' },
  { airline_id: 14, airline_name: 'Aegean Airlines', country: 'Greece' },
  { airline_id: 15, airline_name: 'Turkish Airlines', country: 'Turkey' },
  { airline_id: 16, airline_name: 'British Airways', country: 'United Kingdom' }
];

export const aircraft = [
  { aircraft_id: 1, airline_id: 1, model: 'Airbus A320', aircraft_type: 'Narrow-Body', total_seats: 162, first_seats: 0, business_seats: 12, premium_economy_seats: 0, economy_seats: 150 },
  { aircraft_id: 2, airline_id: 1, model: 'Boeing 787-9 Dreamliner', aircraft_type: 'Wide-Body', total_seats: 278, first_seats: 0, business_seats: 30, premium_economy_seats: 28, economy_seats: 220 },
  { aircraft_id: 3, airline_id: 2, model: 'Airbus A321neo', aircraft_type: 'Narrow-Body', total_seats: 206, first_seats: 0, business_seats: 20, premium_economy_seats: 0, economy_seats: 186 },
  { aircraft_id: 4, airline_id: 3, model: 'Boeing 777', aircraft_type: 'Wide-Body', total_seats: 334, first_seats: 8, business_seats: 42, premium_economy_seats: 24, economy_seats: 260 },
  { aircraft_id: 5, airline_id: 4, model: 'Airbus A330', aircraft_type: 'Wide-Body', total_seats: 300, first_seats: 0, business_seats: 36, premium_economy_seats: 24, economy_seats: 240 },
  { aircraft_id: 6, airline_id: 5, model: 'Boeing 737 MAX', aircraft_type: 'Narrow-Body', total_seats: 178, first_seats: 0, business_seats: 16, premium_economy_seats: 0, economy_seats: 162 },
  { aircraft_id: 7, airline_id: 1, model: 'Airbus A350-900', aircraft_type: 'Wide-Body', total_seats: 320, first_seats: 0, business_seats: 48, premium_economy_seats: 32, economy_seats: 240 },
  { aircraft_id: 8, airline_id: 2, model: 'Embraer E190', aircraft_type: 'Regional', total_seats: 96, first_seats: 0, business_seats: 8, premium_economy_seats: 0, economy_seats: 88 },
  { aircraft_id: 9, airline_id: 8, model: 'Airbus A330neo', aircraft_type: 'Wide-Body', total_seats: 316, first_seats: 0, business_seats: 40, premium_economy_seats: 28, economy_seats: 248 },
  { aircraft_id: 10, airline_id: 9, model: 'Airbus A320neo', aircraft_type: 'Narrow-Body', total_seats: 174, first_seats: 0, business_seats: 12, premium_economy_seats: 0, economy_seats: 162 },
  { aircraft_id: 11, airline_id: 10, model: 'Airbus A321', aircraft_type: 'Narrow-Body', total_seats: 200, first_seats: 0, business_seats: 20, premium_economy_seats: 0, economy_seats: 180 },
  { aircraft_id: 12, airline_id: 11, model: 'Boeing 737-800', aircraft_type: 'Narrow-Body', total_seats: 160, first_seats: 0, business_seats: 16, premium_economy_seats: 0, economy_seats: 144 },
  { aircraft_id: 13, airline_id: 12, model: 'Embraer E195', aircraft_type: 'Regional', total_seats: 120, first_seats: 0, business_seats: 10, premium_economy_seats: 0, economy_seats: 110 },
  { aircraft_id: 14, airline_id: 13, model: 'Boeing 787-8 Dreamliner', aircraft_type: 'Wide-Body', total_seats: 268, first_seats: 0, business_seats: 28, premium_economy_seats: 20, economy_seats: 220 },
  { aircraft_id: 15, airline_id: 14, model: 'ATR 72', aircraft_type: 'Regional', total_seats: 70, first_seats: 0, business_seats: 0, premium_economy_seats: 0, economy_seats: 70 },
  { aircraft_id: 16, airline_id: 15, model: 'Airbus A220', aircraft_type: 'Narrow-Body', total_seats: 130, first_seats: 0, business_seats: 10, premium_economy_seats: 0, economy_seats: 120 },
  { aircraft_id: 17, airline_id: 16, model: 'Bombardier CRJ Series', aircraft_type: 'Regional', total_seats: 76, first_seats: 0, business_seats: 6, premium_economy_seats: 0, economy_seats: 70 }
];

export const users = [
  {
    user_id: 1,
    full_name: 'SkyLink Admin',
    email: 'admin@skylink.com',
    password: 'Admin@12345',
    phone: '+20 100 000 0000',
    nationality: 'Egyptian',
    role: 'admin',
    created_at: new Date().toISOString()
  },
  {
    user_id: 2,
    full_name: 'Maya Hassan',
    email: 'maya@example.com',
    password: 'Customer@12345',
    phone: '+20 111 000 0000',
    nationality: 'Egyptian',
    role: 'customer',
    created_at: new Date().toISOString()
  }
];

export let flights = [
  {
    flight_id: 1,
    flight_code: 'SL101',
    airline_id: 1,
    aircraft_id: 1,
    departure_airport_id: 1,
    arrival_airport_id: 2,
    departure_time: '2026-04-20T09:00:00.000Z',
    arrival_time: '2026-04-20T12:20:00.000Z',
    price: 240,
    available_seats: 24,
    status: 'active',
    discount_value: 12,
    discount_type: 'percentage',
    discount_code: 'SKY12'
  },
  {
    flight_id: 2,
    flight_code: 'SL220',
    airline_id: 1,
    aircraft_id: 2,
    departure_airport_id: 1,
    arrival_airport_id: 3,
    departure_time: '2026-04-22T02:15:00.000Z',
    arrival_time: '2026-04-22T07:45:00.000Z',
    price: 520,
    available_seats: 30,
    status: 'active',
    discount_value: 50,
    discount_type: 'fixed',
    discount_code: 'LONDON50'
  },
  {
    flight_id: 3,
    flight_code: 'NW330',
    airline_id: 2,
    aircraft_id: 3,
    departure_airport_id: 2,
    arrival_airport_id: 4,
    departure_time: '2026-04-24T18:00:00.000Z',
    arrival_time: '2026-04-25T03:30:00.000Z',
    price: 790,
    available_seats: 28,
    status: 'delayed',
    discount_value: 0,
    discount_type: null,
    discount_code: null
  },
  {
    flight_id: 4,
    flight_code: 'GJ440',
    airline_id: 3,
    aircraft_id: 4,
    departure_airport_id: 5,
    arrival_airport_id: 6,
    departure_time: '2026-04-26T13:00:00.000Z',
    arrival_time: '2026-04-26T16:40:00.000Z',
    price: 310,
    available_seats: 36,
    status: 'active',
    discount_value: 0,
    discount_type: null,
    discount_code: null
  },
  { flight_id: 5, flight_code: 'SL305', airline_id: 1, aircraft_id: 1, departure_airport_id: 1, arrival_airport_id: 7, departure_time: '2026-05-01T07:30:00.000Z', arrival_time: '2026-05-01T08:20:00.000Z', price: 95, available_seats: 24, status: 'active', discount_value: 0, discount_type: null, discount_code: null },
  { flight_id: 6, flight_code: 'SL410', airline_id: 1, aircraft_id: 2, departure_airport_id: 1, arrival_airport_id: 8, departure_time: '2026-05-02T10:15:00.000Z', arrival_time: '2026-05-02T13:30:00.000Z', price: 260, available_seats: 30, status: 'active', discount_value: 10, discount_type: 'percentage', discount_code: 'DOHA10' },
  { flight_id: 7, flight_code: 'NW511', airline_id: 2, aircraft_id: 3, departure_airport_id: 7, arrival_airport_id: 9, departure_time: '2026-05-03T12:00:00.000Z', arrival_time: '2026-05-03T14:10:00.000Z', price: 230, available_seats: 28, status: 'active', discount_value: 0, discount_type: null, discount_code: null },
  { flight_id: 8, flight_code: 'GJ612', airline_id: 3, aircraft_id: 4, departure_airport_id: 2, arrival_airport_id: 10, departure_time: '2026-05-04T16:45:00.000Z', arrival_time: '2026-05-04T18:35:00.000Z', price: 210, available_seats: 36, status: 'active', discount_value: 20, discount_type: 'fixed', discount_code: 'RIYADH20' },
  { flight_id: 9, flight_code: 'SL713', airline_id: 1, aircraft_id: 1, departure_airport_id: 11, arrival_airport_id: 5, departure_time: '2026-05-05T08:10:00.000Z', arrival_time: '2026-05-05T14:15:00.000Z', price: 480, available_seats: 24, status: 'active', discount_value: 0, discount_type: null, discount_code: null },
  { flight_id: 10, flight_code: 'NW814', airline_id: 2, aircraft_id: 3, departure_airport_id: 3, arrival_airport_id: 12, departure_time: '2026-05-06T09:20:00.000Z', arrival_time: '2026-05-06T10:45:00.000Z', price: 145, available_seats: 28, status: 'active', discount_value: 5, discount_type: 'percentage', discount_code: 'AMS5' },
  { flight_id: 11, flight_code: 'GJ915', airline_id: 3, aircraft_id: 4, departure_airport_id: 13, arrival_airport_id: 14, departure_time: '2026-05-07T11:35:00.000Z', arrival_time: '2026-05-07T14:05:00.000Z', price: 190, available_seats: 36, status: 'active', discount_value: 0, discount_type: null, discount_code: null },
  { flight_id: 12, flight_code: 'SL1020', airline_id: 1, aircraft_id: 2, departure_airport_id: 15, arrival_airport_id: 16, departure_time: '2026-05-08T06:50:00.000Z', arrival_time: '2026-05-08T09:00:00.000Z', price: 175, available_seats: 30, status: 'delayed', discount_value: 0, discount_type: null, discount_code: null },
  { flight_id: 13, flight_code: 'NW1121', airline_id: 2, aircraft_id: 3, departure_airport_id: 1, arrival_airport_id: 17, departure_time: '2026-05-09T13:25:00.000Z', arrival_time: '2026-05-09T15:05:00.000Z', price: 165, available_seats: 28, status: 'active', discount_value: 0, discount_type: null, discount_code: null },
  { flight_id: 14, flight_code: 'GJ1222', airline_id: 3, aircraft_id: 4, departure_airport_id: 18, arrival_airport_id: 6, departure_time: '2026-05-10T18:15:00.000Z', arrival_time: '2026-05-10T20:25:00.000Z', price: 220, available_seats: 36, status: 'active', discount_value: 0, discount_type: null, discount_code: null },
  { flight_id: 15, flight_code: 'SL1323', airline_id: 1, aircraft_id: 1, departure_airport_id: 19, arrival_airport_id: 20, departure_time: '2026-05-11T05:40:00.000Z', arrival_time: '2026-05-11T06:35:00.000Z', price: 105, available_seats: 24, status: 'active', discount_value: 0, discount_type: null, discount_code: null },
  { flight_id: 16, flight_code: 'NW1424', airline_id: 2, aircraft_id: 3, departure_airport_id: 21, arrival_airport_id: 2, departure_time: '2026-05-12T15:00:00.000Z', arrival_time: '2026-05-12T16:10:00.000Z', price: 155, available_seats: 28, status: 'active', discount_value: 15, discount_type: 'fixed', discount_code: 'MCT15' },
  { flight_id: 17, flight_code: 'GJ1525', airline_id: 3, aircraft_id: 4, departure_airport_id: 22, arrival_airport_id: 23, departure_time: '2026-05-13T22:30:00.000Z', arrival_time: '2026-05-14T05:55:00.000Z', price: 640, available_seats: 36, status: 'active', discount_value: 0, discount_type: null, discount_code: null },
  { flight_id: 18, flight_code: 'SL1626', airline_id: 1, aircraft_id: 2, departure_airport_id: 23, arrival_airport_id: 24, departure_time: '2026-05-15T01:20:00.000Z', arrival_time: '2026-05-15T11:40:00.000Z', price: 890, available_seats: 30, status: 'active', discount_value: 7, discount_type: 'percentage', discount_code: 'PACIFIC7' },
  { flight_id: 19, flight_code: 'NW1727', airline_id: 2, aircraft_id: 3, departure_airport_id: 25, arrival_airport_id: 4, departure_time: '2026-05-16T14:10:00.000Z', arrival_time: '2026-05-16T15:55:00.000Z', price: 180, available_seats: 28, status: 'active', discount_value: 0, discount_type: null, discount_code: null },
  { flight_id: 20, flight_code: 'GJ1828', airline_id: 3, aircraft_id: 4, departure_airport_id: 26, arrival_airport_id: 1, departure_time: '2026-05-17T20:00:00.000Z', arrival_time: '2026-05-18T04:10:00.000Z', price: 570, available_seats: 36, status: 'active', discount_value: 0, discount_type: null, discount_code: null },
  { flight_id: 21, flight_code: 'SL1929', airline_id: 1, aircraft_id: 1, departure_airport_id: 8, arrival_airport_id: 11, departure_time: '2026-05-18T09:00:00.000Z', arrival_time: '2026-05-18T10:05:00.000Z', price: 135, available_seats: 24, status: 'active', discount_value: 0, discount_type: null, discount_code: null },
  { flight_id: 22, flight_code: 'NW2030', airline_id: 2, aircraft_id: 3, departure_airport_id: 9, arrival_airport_id: 18, departure_time: '2026-05-19T17:25:00.000Z', arrival_time: '2026-05-19T19:35:00.000Z', price: 205, available_seats: 28, status: 'active', discount_value: 0, discount_type: null, discount_code: null },
  { flight_id: 23, flight_code: 'GJ2131', airline_id: 3, aircraft_id: 4, departure_airport_id: 12, arrival_airport_id: 13, departure_time: '2026-05-20T07:10:00.000Z', arrival_time: '2026-05-20T08:20:00.000Z', price: 120, available_seats: 36, status: 'active', discount_value: 0, discount_type: null, discount_code: null },
  { flight_id: 24, flight_code: 'SL2232', airline_id: 1, aircraft_id: 2, departure_airport_id: 14, arrival_airport_id: 3, departure_time: '2026-05-21T19:50:00.000Z', arrival_time: '2026-05-21T22:15:00.000Z', price: 260, available_seats: 30, status: 'active', discount_value: 25, discount_type: 'fixed', discount_code: 'MAD25' },
  { flight_id: 25, flight_code: 'MS401', airline_id: 4, aircraft_id: 5, departure_airport_id: 1, arrival_airport_id: 2, departure_time: '2026-05-22T06:15:00.000Z', arrival_time: '2026-05-22T09:25:00.000Z', price: 255, available_seats: 180, status: 'active', discount_value: 0, discount_type: null, discount_code: null },
  { flight_id: 26, flight_code: 'EK512', airline_id: 5, aircraft_id: 6, departure_airport_id: 1, arrival_airport_id: 2, departure_time: '2026-05-22T14:10:00.000Z', arrival_time: '2026-05-22T17:15:00.000Z', price: 295, available_seats: 320, status: 'active', discount_value: 30, discount_type: 'fixed', discount_code: 'EMIRATES30' },
  { flight_id: 27, flight_code: 'BA155', airline_id: 16, aircraft_id: 17, departure_airport_id: 1, arrival_airport_id: 3, departure_time: '2026-05-23T08:00:00.000Z', arrival_time: '2026-05-23T13:20:00.000Z', price: 545, available_seats: 180, status: 'active', discount_value: 0, discount_type: null, discount_code: null },
  { flight_id: 28, flight_code: 'MS777', airline_id: 4, aircraft_id: 5, departure_airport_id: 1, arrival_airport_id: 3, departure_time: '2026-05-23T16:45:00.000Z', arrival_time: '2026-05-23T22:05:00.000Z', price: 505, available_seats: 180, status: 'active', discount_value: 8, discount_type: 'percentage', discount_code: 'LHR8' },
  { flight_id: 29, flight_code: 'QR221', airline_id: 6, aircraft_id: 7, departure_airport_id: 1, arrival_airport_id: 8, departure_time: '2026-05-24T10:20:00.000Z', arrival_time: '2026-05-24T13:05:00.000Z', price: 250, available_seats: 310, status: 'active', discount_value: 0, discount_type: null, discount_code: null },
  { flight_id: 30, flight_code: 'EY310', airline_id: 7, aircraft_id: 8, departure_airport_id: 1, arrival_airport_id: 11, departure_time: '2026-05-24T18:30:00.000Z', arrival_time: '2026-05-24T21:35:00.000Z', price: 245, available_seats: 290, status: 'active', discount_value: 0, discount_type: null, discount_code: null },
  { flight_id: 31, flight_code: 'SV611', airline_id: 8, aircraft_id: 9, departure_airport_id: 1, arrival_airport_id: 9, departure_time: '2026-05-25T04:55:00.000Z', arrival_time: '2026-05-25T07:05:00.000Z', price: 205, available_seats: 300, status: 'active', discount_value: 10, discount_type: 'percentage', discount_code: 'SAUDIA10' },
  { flight_id: 32, flight_code: 'XY480', airline_id: 9, aircraft_id: 10, departure_airport_id: 1, arrival_airport_id: 9, departure_time: '2026-05-25T12:40:00.000Z', arrival_time: '2026-05-25T14:45:00.000Z', price: 185, available_seats: 174, status: 'active', discount_value: 0, discount_type: null, discount_code: null },
  { flight_id: 33, flight_code: 'GF090', airline_id: 10, aircraft_id: 11, departure_airport_id: 1, arrival_airport_id: 20, departure_time: '2026-05-26T09:15:00.000Z', arrival_time: '2026-05-26T12:00:00.000Z', price: 215, available_seats: 166, status: 'active', discount_value: 0, discount_type: null, discount_code: null },
  { flight_id: 34, flight_code: 'WY801', airline_id: 11, aircraft_id: 12, departure_airport_id: 1, arrival_airport_id: 21, departure_time: '2026-05-26T19:35:00.000Z', arrival_time: '2026-05-26T22:20:00.000Z', price: 225, available_seats: 162, status: 'active', discount_value: 12, discount_type: 'fixed', discount_code: 'OMAN12' },
  { flight_id: 35, flight_code: 'RJ504', airline_id: 12, aircraft_id: 13, departure_airport_id: 1, arrival_airport_id: 18, departure_time: '2026-05-27T07:25:00.000Z', arrival_time: '2026-05-27T09:00:00.000Z', price: 175, available_seats: 120, status: 'active', discount_value: 0, discount_type: null, discount_code: null },
  { flight_id: 36, flight_code: 'A3896', airline_id: 14, aircraft_id: 15, departure_airport_id: 1, arrival_airport_id: 16, departure_time: '2026-05-27T15:10:00.000Z', arrival_time: '2026-05-27T17:30:00.000Z', price: 190, available_seats: 180, status: 'active', discount_value: 0, discount_type: null, discount_code: null }
];

export let discounts = [
  { discount_id: 1, code: 'WELCOME10', value: 10, type: 'percentage', scope: 'all', flight_id: null, active: true },
  { discount_id: 2, code: 'SKY12', value: 12, type: 'percentage', scope: 'flight', flight_id: 1, active: true },
  { discount_id: 3, code: 'LONDON50', value: 50, type: 'fixed', scope: 'flight', flight_id: 2, active: true }
];

export let bookings = [
  {
    booking_id: 1,
    user_id: 2,
    flight_id: 1,
    status: 'confirmed',
    payment_status: 'pending',
    total_amount: 240,
    passenger_count: 1,
    created_at: new Date().toISOString()
  }
];

export let bookingPassengers = [
  { passenger_id: 1, booking_id: 1, full_name: 'Maya Hassan', passport_number: 'A12345678', class_type: 'Economy', seat_number: '1A' }
];

export const notifications = [
  { id: 1, title: 'Welcome to SkyLink', body: 'Check your flight status before travelling.', created_at: new Date().toISOString() },
  { id: 2, title: 'AI recommendations are live', body: 'Search and booking activity now improves your suggested flights.', created_at: new Date().toISOString() }
];

export let searchHistory = [];

export let flightTransitStops = [
  {
    transit_id: 1,
    flight_id: 2,
    airport_code: 'DXB',
    airport_name: 'Dubai International Airport',
    arrival_time: '2026-05-02T05:05:00.000Z',
    departure_time: '2026-05-02T06:25:00.000Z',
    layover_minutes: 80,
    stop_order: 1
  }
];

export function setFlights(nextFlights) {
  flights = nextFlights;
}

export function setDiscounts(nextDiscounts) {
  discounts = nextDiscounts;
}

export function setBookings(nextBookings) {
  bookings = nextBookings;
}

export function setBookingPassengers(nextPassengers) {
  bookingPassengers = nextPassengers;
}

export function setSearchHistory(nextSearchHistory) {
  searchHistory = nextSearchHistory;
}

export function setFlightTransitStops(nextTransitStops) {
  flightTransitStops = nextTransitStops;
}

export function enrichFlight(flight) {
  const departure = airports.find((item) => item.airport_id === Number(flight.departure_airport_id));
  const arrival = airports.find((item) => item.airport_id === Number(flight.arrival_airport_id));
  const airline = airlines.find((item) => item.airline_id === Number(flight.airline_id));
  const plane = aircraft.find((item) => item.aircraft_id === Number(flight.aircraft_id));
  return {
    ...flight,
    departure_code: departure?.airport_code,
    departure_city: departure?.city,
    arrival_code: arrival?.airport_code,
    arrival_city: arrival?.city,
    airline_name: airline?.airline_name,
    aircraft_model: plane?.model,
    aircraft_type: plane?.aircraft_type,
    total_seats: plane?.total_seats,
    aircraft_first_seats: plane?.first_seats,
    aircraft_business_seats: plane?.business_seats,
    aircraft_premium_economy_seats: plane?.premium_economy_seats,
    aircraft_economy_seats: plane?.economy_seats,
    is_direct: flight.is_direct ?? true,
    transit_count: Number(flight.transit_count || 0),
    total_duration: Number(flight.total_duration || 0)
  };
}
