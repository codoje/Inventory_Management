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

    // =================== GOOGLE SHEETS FETCH ===================
    const apiKey = 'AIzaSyBxY3mesvB0hWrW-Qy4CoKNzUg-85XCg-M'; // Replace with your real key
    const sheetId = '1XNQFX5_e8mMF7Ara5gV51uLIJFhAH9-DuTtPMyZV91w';
    const range = 'Sheet1!A2:E'; // Update as needed

    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            const values = data.values;
            console.log(values);

            const container = document.querySelector('.subjects');
            container.innerHTML = ''; // Clear old content

           values.forEach((row, index) => {
  const [itemName, quantity, expiration, status, lastChecked] = row;
  
  // Pick a class dynamically (rotating through some of your existing card styles)
  const cardClasses = ['eg', 'mth', 'cs', 'cg', 'net'];
  const cardClass = cardClasses[index % cardClasses.length];

  const div = document.createElement('div');
  div.classList.add(cardClass);
  div.innerHTML = `
    <span class="material-icons-sharp">inventory</span>
    <h3>${itemName}</h3>
    <h2>${quantity}</h2>
    <div class="progress">
      <svg><circle cx="38" cy="38" r="36"></circle></svg>
      <div class="number"><p>${status}%</p></div>
    </div>
    <small class="text-muted">Exp: ${expiration} | Checked: ${lastChecked}</small>
  `;
  container.appendChild(div);
});

        })
        .catch(error => console.error('Error fetching Google Sheet data:', error));

    // =================== YOUR TIMETABLE STUFF ===================
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
