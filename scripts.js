const cities = [
  // New Zealand
  { code: 'AKL', name: 'Auckland', timeZone: 'Pacific/Auckland', region: 'New Zealand' },
  { code: 'CHC', name: 'Christchurch', timeZone: 'Pacific/Auckland', region: 'New Zealand' },
  { code: 'NZD', name: 'New Zealand', timeZone: 'Pacific/Auckland', region: 'New Zealand' },
  // Asia
  { code: 'TPE', name: 'Taipei', timeZone: 'Asia/Taipei', region: 'Asia' },
  { code: 'PVG', name: 'Shanghai', timeZone: 'Asia/Shanghai', region: 'Asia' },
  { code: 'NRT', name: 'Tokyo Narita', timeZone: 'Asia/Tokyo', region: 'Asia' },
  { code: 'HKG', name: 'Hong Kong', timeZone: 'Asia/Hong_Kong', region: 'Asia' },
  { code: 'SIN', name: 'Singapore', timeZone: 'Asia/Singapore', region: 'Asia' },
  { code: 'DPS', name: 'Bali Denpasar', timeZone: 'Asia/Makassar', region: 'Asia' },
  // Australia
  { code: 'SYD', name: 'Sydney', timeZone: 'Australia/Sydney', region: 'Australia' },
  { code: 'MEL', name: 'Melbourne', timeZone: 'Australia/Melbourne', region: 'Australia' },
  { code: 'BNE', name: 'Brisbane', timeZone: 'Australia/Brisbane', region: 'Australia' },
  { code: 'PER', name: 'Perth', timeZone: 'Australia/Perth', region: 'Australia' },
  { code: 'OOL', name: 'Gold Coast', timeZone: 'Australia/Brisbane', region: 'Australia' },
  { code: 'ADE', name: 'Adelaide', timeZone: 'Australia/Adelaide', region: 'Australia' },
  { code: 'MCY', name: 'Sunshine Coast', timeZone: 'Australia/Brisbane', region: 'Australia' },
  // Americas
  { code: 'SFO', name: 'San Francisco', timeZone: 'America/Los_Angeles', region: 'Americas' },
  { code: 'LAX', name: 'Los Angeles', timeZone: 'America/Los_Angeles', region: 'Americas' },
  { code: 'HNL', name: 'Honolulu', timeZone: 'Pacific/Honolulu', region: 'Americas' },
  { code: 'YVR', name: 'Vancouver', timeZone: 'America/Vancouver', region: 'Americas' },
  { code: 'HOU', name: 'Houston', timeZone: 'America/Chicago', region: 'Americas' },
  { code: 'JFK', name: 'New York JFK', timeZone: 'America/New_York', region: 'Americas' },
  // Pacific Islands
  { code: 'RAR', name: 'Rarotonga', timeZone: 'Pacific/Rarotonga', region: 'Pacific Islands' },
  { code: 'NAN', name: 'Nadi Fiji', timeZone: 'Pacific/Fiji', region: 'Pacific Islands' },
  { code: 'NIU', name: 'Niue', timeZone: 'Pacific/Niue', region: 'Pacific Islands' },
  { code: 'APW', name: 'Apia Samoa', timeZone: 'Pacific/Apia', region: 'Pacific Islands' },
  { code: 'TBU', name: 'Tonga', timeZone: 'Pacific/Tongatapu', region: 'Pacific Islands' },
  { code: 'NOU', name: 'New Caledonia', timeZone: 'Pacific/Noumea', region: 'Pacific Islands' },
  { code: 'PPT', name: 'Tahiti', timeZone: 'Pacific/Tahiti', region: 'Pacific Islands' }
];

const DEFAULT_SELECTED = ['AKL', 'SYD', 'SIN', 'LAX', 'RAR'];
const DEFAULT_PRIMARY = 'AKL';
const MIN_CITIES = 3;
const MAX_TILES = getMaxTiles();
const MAX_CITIES_PER_TIMEZONE = 3;

let selectedCodes = JSON.parse(localStorage.getItem('selectedCities')) || DEFAULT_SELECTED;
let primaryCode = localStorage.getItem('primaryCity') || DEFAULT_PRIMARY;
let timeFormat = localStorage.getItem('timeFormat') || '24';
let renderedGroups = [];

const clockContainer = document.getElementById('clockContainer');
const citySelector = document.getElementById('citySelector');
const primarySelect = document.getElementById('primarySelect');
const message = document.getElementById('message');
const settingsBtn = document.getElementById('settingsBtn');
const settingsPanel = document.getElementById('settingsPanel');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const resetBtn = document.getElementById('resetBtn');
const format24 = document.getElementById('format24');
const format12 = document.getElementById('format12');

const layoutMap = {
  2: [[1, 2], [3, 2]],
  3: [[1, 2], [3, 2], [5, 2]],
  4: [[1, 2], [3, 2], [5, 2], [7, 2]],
  5: [[5, 1], [1, 2], [3, 2], [5, 2], [7, 2]],
  6: [[5, 1], [7, 1], [1, 2], [3, 2], [5, 2], [7, 2]],
  7: [[5, 1], [1, 2], [3, 2], [5, 2], [1, 3], [3, 3], [5, 3]],
  8: [[5, 1], [2, 2], [4, 2], [6, 2], [1, 3], [3, 3], [5, 3], [7, 3]],
  9: [[5, 1], [1, 2], [3, 2], [5, 2], [7, 2], [1, 3], [3, 3], [5, 3], [7, 3]],
  10: [
    [5, 1], [7, 1],                   // row 1 (without primary)
    [1, 2], [3, 2], [5, 2], [7, 2],   // row 2 (4 tiles)
    [1, 3], [3, 3], [5, 3], [7, 3]    // row 3 (4 tiles)
  ]
};

selectedCodes = selectedCodes.filter(code => getCity(code));

if (selectedCodes.length < MIN_CITIES) {
  selectedCodes = [...DEFAULT_SELECTED];
}

if (!selectedCodes.includes(primaryCode)) {
  primaryCode = selectedCodes[0];
}

function getMaxTiles() {
  const isUltraWide = window.matchMedia('(min-aspect-ratio: 2 / 1)').matches;
  const isMobile = window.matchMedia('(max-width: 700px)').matches;

  return isUltraWide || isMobile ? 7 : 7;
}

function saveSettings() {
  localStorage.setItem('selectedCities', JSON.stringify(selectedCodes));
  localStorage.setItem('primaryCity', primaryCode);
  localStorage.setItem('timeFormat', timeFormat);
}

function getCity(code) {
  return cities.find(city => city.code === code);
}

function applyTimeFormatClass() {
  document.body.classList.toggle('format-12', timeFormat === '12');
}

function renderTimeFormatToggle() {
  if (!format24 || !format12) return;

  format24.checked = timeFormat === '24';
  format12.checked = timeFormat === '12';
}

if (format24 && format12) {
  format24.addEventListener('change', () => {
    timeFormat = '24';
    saveSettings();
    applyTimeFormatClass();
    renderTimeFormatToggle();
    updateTime();
  });

  format12.addEventListener('change', () => {
    timeFormat = '12';
    saveSettings();
    applyTimeFormatClass();
    renderTimeFormatToggle();
    updateTime();
  });
}

settingsBtn.addEventListener('click', event => {
  event.stopPropagation();
  settingsPanel.classList.toggle('hidden');
});

settingsPanel.addEventListener('click', event => {
  event.stopPropagation();
});

document.addEventListener('click', () => {
  settingsPanel.classList.add('hidden');
});

closeSettingsBtn.addEventListener('click', () => {
  settingsPanel.classList.add('hidden');
});

resetBtn.addEventListener('click', () => {
  selectedCodes = [...DEFAULT_SELECTED];
  primaryCode = DEFAULT_PRIMARY;

  saveSettings();
  renderSelector();
  renderPrimarySelect();
  renderClocks();
  showMessage('Reset to default cities.');
});

function toggleFullscreen() {
  const viewer = document.querySelector('.viewer');

  if (!viewer) return;

  if (!document.fullscreenElement) {
    viewer.requestFullscreen().catch(console.error);
  } else {
    document.exitFullscreen().catch(console.error);
  }
}

function getOffsetMinutes(timeZone) {
  const now = new Date();

  const parts = new Intl.DateTimeFormat('en-NZ', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).formatToParts(now);

  const data = {};
  parts.forEach(part => {
    if (part.type !== 'literal') {
      data[part.type] = part.value;
    }
  });

  const asUTC = Date.UTC(
    Number(data.year),
    Number(data.month) - 1,
    Number(data.day),
    Number(data.hour),
    Number(data.minute),
    Number(data.second)
  );

  return Math.round((asUTC - now.getTime()) / 60000);
}

function groupSelectedCities() {
  const selected = selectedCodes.map(getCity).filter(Boolean);
  const groups = {};

  selected.forEach(city => {
    const offset = getOffsetMinutes(city.timeZone);
    const key = `UTC_${offset}`;

    if (!groups[key]) {
      groups[key] = {
        offset,
        cities: [],
        timeZone: city.timeZone
      };
    }

    groups[key].cities.push(city);
  });

  return Object.values(groups)
    .map(group => ({
      ...group,
      label: group.cities.map(city => city.code).join(' | '),
      isPrimary: group.cities.some(city => city.code === primaryCode)
    }))
    .sort((a, b) => b.offset - a.offset);
}

function createClockTile(group, isPrimary) {
  const clock = document.createElement('div');
  const cityCount = group.cities.length;

  clock.className = [
    'clock',
    isPrimary ? 'primarycity' : '',
    cityCount === 2 ? 'two-cities' : '',
    cityCount >= 3 ? 'three-cities' : ''
  ].filter(Boolean).join(' ');

  clock.innerHTML = `
    <h2>${group.label}</h2>
    <div class="region">
      <div class="weekday"></div>
      <div class="time"></div>
    </div>
  `;

  return clock;
}

function renderClocks() {
  clockContainer.innerHTML = '';

  renderedGroups = groupSelectedCities();

  const primaryGroup =
    renderedGroups.find(group => group.isPrimary) || renderedGroups[0];

  const secondaryGroups =
    renderedGroups.filter(group => group !== primaryGroup);

  clockContainer.appendChild(createClockTile(primaryGroup, true));

  const secondaryGrid = document.createElement('div');
	secondaryGrid.className = `secondary-grid secondary-count-${secondaryGroups.length}`;

  const layout = layoutMap[secondaryGroups.length] || layoutMap[9];

  secondaryGroups.forEach((group, index) => {
    const tile = createClockTile(group, false);
    const [col, row] = layout[index];

    tile.style.setProperty('--col', col);
    tile.style.setProperty('--row', row);

    secondaryGrid.appendChild(tile);
  });

  clockContainer.appendChild(secondaryGrid);

  updateTime();
}

function updateTime() {
  const now = new Date();
  const tiles = document.querySelectorAll('.clock');

  const primaryGroup =
    renderedGroups.find(group => group.isPrimary) || renderedGroups[0];

  const orderedGroups = [
    primaryGroup,
    ...renderedGroups.filter(group => group !== primaryGroup)
  ];

  orderedGroups.forEach((group, index) => {
    const tile = tiles[index];
    if (!tile) return;

    const timeElement = tile.querySelector('.time');
    const weekdayElement = tile.querySelector('.weekday');

    if (!timeElement || !weekdayElement) return;

    const formatter = new Intl.DateTimeFormat('en-NZ', {
      timeZone: group.timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: timeFormat === '12',
      hourCycle: timeFormat === '24' ? 'h23' : undefined
    });

    let timeString = formatter.format(now);

    if (timeFormat === '12') {
      const parts = timeString.split(' ');

      if (parts.length === 2) {
        timeString = `${parts[0]} <span class="ampm">${parts[1]}</span>`;
      }
    }

    const weekdayString = new Intl.DateTimeFormat('en-NZ', {
      timeZone: group.timeZone,
      weekday: 'long'
    }).format(now);

    const hourString = new Intl.DateTimeFormat('en-NZ', {
      timeZone: group.timeZone,
      hour: '2-digit',
      hourCycle: 'h23'
    }).format(now);

    const hours = Number(hourString);

    timeElement.innerHTML = timeString;
    weekdayElement.textContent = weekdayString;

    tile.classList.toggle('daytime', hours >= 6 && hours < 18);
    timeElement.className = `time ${hours >= 6 && hours < 18 ? 'am-time' : 'pm-time'}`;
    weekdayElement.className = `weekday ${hours >= 6 && hours < 18 ? 'weekday-daytime' : 'weekday-nighttime'}`;
  });
}

function renderSelector() {
  citySelector.innerHTML = '';

  const regions = [
    { title: 'New Zealand', codes: ['AKL', 'NZD', 'CHC'] },
    { title: 'Asia', codes: ['TPE', 'PVG', 'NRT', 'HKG', 'SIN', 'DPS'] },
    { title: 'Australia', codes: ['SYD', 'MEL', 'BNE', 'PER', 'OOL', 'ADE', 'MCY'] },
    { title: 'Americas', codes: ['SFO', 'LAX', 'HNL', 'YVR', 'HOU', 'JFK'] },
    { title: 'Pacific Islands', codes: ['RAR', 'NAN', 'NIU', 'APW', 'TBU', 'NOU', 'PPT'] }
  ];

  regions.forEach(region => {
    const regionBlock = document.createElement('div');
    regionBlock.className = 'region-block';

    const heading = document.createElement('div');
    heading.className = 'region-title';
    heading.textContent = region.title;
    regionBlock.appendChild(heading);

    const optionsWrap = document.createElement('div');
    optionsWrap.className = 'region-options';

    region.codes.forEach(code => {
      const city = getCity(code);
      if (!city) return;

      const label = document.createElement('label');
      label.className = 'city-option';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = city.code;
      checkbox.checked = selectedCodes.includes(city.code);

      checkbox.addEventListener('change', () => {
        const cityOffset = getOffsetMinutes(city.timeZone);

        const sameTimezoneSelected = selectedCodes
          .map(getCity)
          .filter(selectedCity =>
            selectedCity && getOffsetMinutes(selectedCity.timeZone) === cityOffset
          );

        const selectedOffsets = new Set(
          selectedCodes
            .map(code => {
              const selectedCity = getCity(code);
              return selectedCity ? getOffsetMinutes(selectedCity.timeZone) : null;
            })
            .filter(offset => offset !== null)
        );

        const wouldAddNewTile = !selectedOffsets.has(cityOffset);
        const maxTiles = getMaxTiles();

        if (checkbox.checked) {
          if (wouldAddNewTile && selectedOffsets.size >= maxTiles) {
            checkbox.checked = false;
            showMessage(`Maximum ${maxTiles} timezone tiles only.`);
            return;
          }

          if (sameTimezoneSelected.length >= 3) {
            checkbox.checked = false;
            showMessage('Maximum 3 cities per shared timezone.');
            return;
          }

          selectedCodes.push(city.code);
        } else {
          const remainingCities = selectedCodes
            .filter(code => code !== city.code)
            .map(getCity)
            .filter(Boolean);

          const remainingOffsets = new Set(
            remainingCities.map(c => getOffsetMinutes(c.timeZone))
          );

          if (remainingOffsets.size < 5) {
            checkbox.checked = true;
            showMessage('Minimum 5 timezones required.');
            return;}

          selectedCodes = selectedCodes.filter(selectedCode => selectedCode !== city.code);

          if (primaryCode === city.code) {
            primaryCode = selectedCodes[0];
          }
        }

        saveSettings();
        renderSelector();
        renderPrimarySelect();
        renderClocks();
        showMessage('');
      });

      label.appendChild(checkbox);
      label.append(` ${city.code} — ${city.name}`);
      optionsWrap.appendChild(label);
    });

    regionBlock.appendChild(optionsWrap);
    citySelector.appendChild(regionBlock);
  });
}

function renderPrimarySelect() {
  primarySelect.innerHTML = '';

  const selectedCitiesSorted = [...selectedCodes]
    .map(getCity)
    .filter(Boolean)
    .sort((a, b) => getOffsetMinutes(b.timeZone) - getOffsetMinutes(a.timeZone));

  selectedCitiesSorted.forEach(city => {
    const option = document.createElement('option');
    option.value = city.code;
    option.textContent = `${city.code} — ${city.name}`;
    option.selected = city.code === primaryCode;
    
    primarySelect.appendChild(option);
  });

  primarySelect.onchange = () => {
    primaryCode = primarySelect.value;
    saveSettings();
    renderClocks();
  };
}

let messageTimeout;

function showMessage(text) {
  clearTimeout(messageTimeout);
  message.textContent = text;

  if (text) {
    message.classList.add('show');

    messageTimeout = setTimeout(() => {
      message.textContent = '';
      message.classList.remove('show');
    }, 2200);
  } else {
    message.classList.remove('show');
  }
}

saveSettings();
renderSelector();
renderPrimarySelect();
applyTimeFormatClass();
renderTimeFormatToggle();
renderClocks();

setInterval(updateTime, 1000);