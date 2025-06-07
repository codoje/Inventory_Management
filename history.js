document.addEventListener('DOMContentLoaded', () => {
  const loggedInUser = localStorage.getItem('username');
  if (!loggedInUser) {
    window.location.href = 'index.html';
  }

  // Update displayed company name in sidebar
  const companyInfo = document.querySelector('.profile .info p');
  if (companyInfo) {
    companyInfo.innerHTML = `<b>Company:</b> ${loggedInUser}`;
  }

  const container = document.querySelector('.subjects');
  const dateSelect = document.getElementById('historyDateSelect');
  const apiKey = 'AIzaSyBxY3mesvB0hWrW-Qy4CoKNzUg-85XCg-M';
  const sheetId = '1XNQFX5_e8mMF7Ara5gV51uLIJFhAH9-DuTtPMyZV91w';
  const range = 'Archive!A2:E';

  // Fetch available dates on page load
  fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`)
    .then(response => response.json())
    .then(data => {
      const values = data.values || [];

      // Extract unique dates from Archive
      const uniqueDates = new Set();
      values.forEach(row => {
        const timestamp = row[0];
        if (timestamp) {
          const rowDate = new Date(timestamp).toISOString().slice(0, 10);
          uniqueDates.add(rowDate);
        }
      });

      // Sort and populate dropdown
      Array.from(uniqueDates).sort().forEach(date => {
        const option = document.createElement('option');
        option.value = date;
        option.textContent = date;
        dateSelect.appendChild(option);
      });
    })
    .catch(error => console.error('Error fetching available dates:', error));

  // Load history for the selected date
  window.loadHistory = function () {
    const selectedDate = dateSelect.value;
    if (!selectedDate) {
      alert('Please select a date.');
      return;
    }

    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`)
      .then(response => response.json())
      .then(data => {
        const values = data.values || [];
        const filteredRows = values.filter(row => {
          const [timestamp, location] = row;
          if (!timestamp || !location) return false;
          const rowDate = new Date(timestamp).toISOString().slice(0, 10);
          return rowDate === selectedDate && location.includes(loggedInUser);
        });

        // Group data by ambulance > cabinet > items
        const ambulances = {};
        filteredRows.forEach(row => {
          const [timestamp, location, itemName, expiration, barcode] = row;
          const parts = location.split('>');
          const ambulance = parts[1] || 'Unknown';
          const cabinet = parts[2] || 'Unknown';

          if (!ambulances[ambulance]) ambulances[ambulance] = {};
          if (!ambulances[ambulance][cabinet]) ambulances[ambulance][cabinet] = [];

          ambulances[ambulance][cabinet].push({ itemName, expiration, barcode });
        });

        // Render ambulances
        container.innerHTML = '';
        Object.keys(ambulances).forEach(ambulance => {
          const ambulanceDiv = document.createElement('div');
          ambulanceDiv.classList.add('eg');
          ambulanceDiv.innerHTML = `
            <h3>Ambulance: ${ambulance}</h3>
            <button onclick="showCabinets('${ambulance}')">View Cabinets</button>
          `;
          container.appendChild(ambulanceDiv);
        });

        // Store the data for drill-down
        window.historyData = ambulances;
      })
      .catch(error => console.error('Error fetching Archive data:', error));
  };

  // Show cabinets for selected ambulance
  window.showCabinets = function (ambulance) {
    const cabinets = window.historyData[ambulance];
    container.innerHTML = '';
    Object.keys(cabinets).forEach(cabinet => {
      const cabinetDiv = document.createElement('div');
      cabinetDiv.classList.add('eg');
      cabinetDiv.innerHTML = `
        <h3>Cabinet: ${cabinet}</h3>
        <button onclick="showItems('${ambulance}', '${cabinet}')">View Items</button>
      `;
      container.appendChild(cabinetDiv);
    });
  };

  // Show items for selected cabinet
  window.showItems = function (ambulance, cabinet) {
    const items = window.historyData[ambulance][cabinet];
    container.innerHTML = '';
    items.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.classList.add('eg');
      itemDiv.innerHTML = `
        <h3>Item: ${item.itemName}</h3>
        <p>Expiration: ${item.expiration || 'N/A'}</p>
        <p>Barcode: ${item.barcode}</p>
      `;
      container.appendChild(itemDiv);
    });
  };
});
