document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.subjects');
  const apiKey = 'AIzaSyBxY3mesvB0hWrW-Qy4CoKNzUg-85XCg-M';
  const sheetId = '1XNQFX5_e8mMF7Ara5gV51uLIJFhAH9-DuTtPMyZV91w';
  const range = 'Sheet1!A2:E';

  const selectedCompany = localStorage.getItem('selectedCompany');
  const selectedAmbulance = localStorage.getItem('selectedAmbulance');

  fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`)
    .then(response => response.json())
    .then(data => {
      const values = data.values || [];
      const cabinetData = {};

      values.forEach(row => {
        const [timestamp, location, itemName, expiration] = row;

        if (!location) return;
        const parts = location.split('>');
        const company = parts[0]?.trim() || 'Unknown';
        const ambulance = parts[1]?.trim() || 'Unknown';
        const cabinet = parts[2]?.trim() || 'Unknown';

        if (company !== selectedCompany || ambulance !== selectedAmbulance) return;

        let status = 'unknown';
        if (expiration && /^\d{4}-\d{2}-\d{2}$/.test(expiration)) {
          const expDate = new Date(expiration);
          const today = new Date();
          if (expDate < today) status = 'red';
          else if (expDate <= new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000)) status = 'yellow';
          else if (expDate > new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)) status = 'green';
          else status = 'yellow';
        }

        if (!cabinetData[cabinet]) cabinetData[cabinet] = { green: 0, yellow: 0, red: 0 };
        if (status === 'green' || status === 'yellow' || status === 'red') {
          cabinetData[cabinet][status]++;
        }
      });

      console.log("Processed cabinet data:", cabinetData);

      container.innerHTML = '';
      for (const [cabinet, stats] of Object.entries(cabinetData)) {
        const total = stats.green + stats.yellow + stats.red;
        const greenPerc = total ? Math.round((stats.green / total) * 100) : 0;
        const yellowPerc = total ? Math.round((stats.yellow / total) * 100) : 0;
        const redPerc = total ? Math.round((stats.red / total) * 100) : 0;

        const div = document.createElement('div');
        div.classList.add('eg');
        const canvasId = `cabinet-${cabinet}`;
        div.innerHTML = `
          <h3>Cabinet: ${cabinet}</h3>
          <canvas id="${canvasId}" width="100" height="100"></canvas>
          <small class="text-muted">Green: ${greenPerc}% | Yellow: ${yellowPerc}% | Red: ${redPerc}%</small>
        `;
        div.addEventListener('click', () => {
        localStorage.setItem('selectedCabinet', cabinet);
        window.location.href = 'cabinet.html';
        });

        container.appendChild(div);

        const ctx = document.getElementById(canvasId).getContext('2d');
        new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Green', 'Yellow', 'Red'],
            datasets: [{
              data: [stats.green, stats.yellow, stats.red],
              backgroundColor: ['#41f1b6', '#ffbb55', '#ff7782'],
              borderWidth: 0
            }]
          },
          options: {
            cutout: '70%',
            plugins: { legend: { display: false }, tooltip: { enabled: false } }
          }
        });
      }
    })
    .catch(error => console.error('Error fetching Google Sheet data:', error));
});
