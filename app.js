document.addEventListener('DOMContentLoaded', () => {
  // =================== ORIGINAL FUNCTIONALITY ===================
  const sideMenu = document.querySelector("aside");
  const profileBtn = document.querySelector("#profile-btn");
  const themeToggler = document.querySelector(".theme-toggler");
  const nextDay = document.getElementById('nextDay');
  const prevDay = document.getElementById('prevDay');

  profileBtn.onclick = function() {
    sideMenu.classList.toggle('active');
  }

  window.onscroll = () => {
    sideMenu.classList.remove('active');
    if(window.scrollY > 0) {
      document.querySelector('header').classList.add('active');
    } else {
      document.querySelector('header').classList.remove('active');
    }
  }

  const applySavedTheme = () => {
    const isDarkMode = localStorage.getItem('dark-theme') === 'true';
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
      themeToggler.querySelector('span:nth-child(1)').classList.add('active');
      themeToggler.querySelector('span:nth-child(2)').classList.remove('active');
    } else {
      document.body.classList.remove('dark-theme');
      themeToggler.querySelector('span:nth-child(1)').classList.remove('active');
      themeToggler.querySelector('span:nth-child(2)').classList.add('active');
    }
  }
  applySavedTheme();

  themeToggler.onclick = function() {
    document.body.classList.toggle('dark-theme');
    themeToggler.querySelector('span:nth-child(1)').classList.toggle('active');
    themeToggler.querySelector('span:nth-child(2)').classList.toggle('active');
    localStorage.setItem('dark-theme', document.body.classList.contains('dark-theme'));
  }

  // =================== GOOGLE SHEETS FETCH AND DYNAMIC DASHBOARD ===================
  const container = document.querySelector('.subjects');
  const apiKey = 'AIzaSyBxY3mesvB0hWrW-Qy4CoKNzUg-85XCg-M';
  const sheetId = '1XNQFX5_e8mMF7Ara5gV51uLIJFhAH9-DuTtPMyZV91w';
  const range = 'Sheet1!A2:E';

  fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`)
    .then(response => response.json())
    .then(data => {
      const values = data.values || [];
      const ambulanceData = {};

      values.forEach(row => {
        const [timestamp, location, itemName, expiration] = row;

        if (!location) return;
        const parts = location.split('>');
        const company = parts[0]?.trim() || 'Unknown';
        const ambulance = parts[1]?.trim() || 'Unknown';

        let status = 'unknown';
        if (expiration && /^\d{4}-\d{2}-\d{2}$/.test(expiration)) {
          const expDate = new Date(expiration);
          const today = new Date();
          if (expDate < today) status = 'red';
          else if (expDate <= new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000)) status = 'yellow';
          else if (expDate > new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)) status = 'green';
          else status = 'yellow';
        }

        if (!ambulanceData[company]) ambulanceData[company] = {};
        if (!ambulanceData[company][ambulance]) ambulanceData[company][ambulance] = { green: 0, yellow: 0, red: 0 };

        if (status === 'green' || status === 'yellow' || status === 'red') {
          ambulanceData[company][ambulance][status]++;
        }
      });

      console.log("Processed ambulance data:", ambulanceData);

      // Filter for a single company (Macungie_Amb for example)
      const companyName = "MacungieAmb";
      const companyAmbulances = ambulanceData[companyName] || {};

      container.innerHTML = ''; // Clear static cards!

      for (const [ambulance, stats] of Object.entries(companyAmbulances)) {
        const total = stats.green + stats.yellow + stats.red;
        const greenPerc = total ? Math.round((stats.green / total) * 100) : 0;
        const yellowPerc = total ? Math.round((stats.yellow / total) * 100) : 0;
        const redPerc = total ? Math.round((stats.red / total) * 100) : 0;

const div = document.createElement('div');
div.classList.add('eg');
const canvasId = `ambulance-${ambulance}`;
div.innerHTML = `
  <h3>Ambulance ${ambulance}</h3>
  <canvas id="${canvasId}" width="100" height="100"></canvas>
  <small class="text-muted">Green: ${greenPerc}% | Yellow: ${yellowPerc}% | Red: ${redPerc}%</small>
`;
div.addEventListener('click', () => {
  localStorage.setItem('selectedAmbulance', ambulance);
  localStorage.setItem('selectedCompany', companyName);
  window.location.href = 'ambulance.html';
});
container.appendChild(div);

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

  // =================== TIMETABLE FUNCTIONALITY (unchanged) ===================
  let setData = (day) => {
    document.querySelector('table tbody').innerHTML = '';
    let daylist = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    document.querySelector('.timetable div h2').innerHTML = daylist[day];

    let daySchedule = [];
    switch(day) {
      case 0: daySchedule = Sunday; break;
      case 1: daySchedule = Monday; break;
      case 2: daySchedule = Tuesday; break;
      case 3: daySchedule = Wednesday; break;
      case 4: daySchedule = Thursday; break;
      case 5: daySchedule = Friday; break;
      case 6: daySchedule = Saturday; break;
    }

    daySchedule.forEach(sub => {
      const tr = document.createElement('tr');
      const trContent = `
        <td>${sub.time}</td>
        <td>${sub.roomNumber}</td>
        <td>${sub.subject}</td>
        <td>${sub.type}</td>
      `;
      tr.innerHTML = trContent;
      document.querySelector('table tbody').appendChild(tr);
    });
  }

  let now = new Date();
  let today = now.getDay();
  let day = today;

  function timeTableAll(){
    document.getElementById('timetable').classList.toggle('active');
    setData(today);
    document.querySelector('.timetable div h2').innerHTML = "Today's Timetable";
  }

  nextDay.onclick = function() {
    day <= 5 ? day++ : day = 0;
    setData(day);
  }

  prevDay.onclick = function() {
    day >= 1 ? day-- : day = 6;
    setData(day);
  }

  setData(day);
  document.querySelector('.timetable div h2').innerHTML = "Today's Timetable";
});
