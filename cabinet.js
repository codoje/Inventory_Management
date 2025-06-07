document.addEventListener('DOMContentLoaded', () => {
const container = document.querySelector('.subjects');
const apiKey = 'AIzaSyBxY3mesvB0hWrW-Qy4CoKNzUg-85XCg-M';
const sheetId = '1XNQFX5_e8mMF7Ara5gV51uLIJFhAH9-DuTtPMyZV91w';
const range = 'Sheet1!A2:E';

  const company = localStorage.getItem('selectedCompany');
  const ambulance = localStorage.getItem('selectedAmbulance');
  const cabinet = localStorage.getItem('selectedCabinet');

  fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`)
    .then(response => response.json())
    .then(data => {
      const values = data.values || [];
      const items = [];

      values.forEach(row => {
        const [timestamp, location, itemName, expiration] = row;

        if (!location) return;
        const parts = location.split('>');
        const rowCompany = parts[0]?.trim();
        const rowAmbulance = parts[1]?.trim();
        const rowCabinet = parts[2]?.trim();

        if (rowCompany === company && rowAmbulance === ambulance && rowCabinet === cabinet) {
          items.push({ itemName, expiration });
        }
      });

      console.log("Items in cabinet:", items);

      container.innerHTML = '';
// Sort items by expiration date (soonest first)
items.sort((a, b) => {
  const dateA = a.expiration && /^\d{4}-\d{2}-\d{2}$/.test(a.expiration) ? new Date(a.expiration) : new Date('9999-12-31');
  const dateB = b.expiration && /^\d{4}-\d{2}-\d{2}$/.test(b.expiration) ? new Date(b.expiration) : new Date('9999-12-31');
  return dateA - dateB;
});

items.forEach(item => {
  const div = document.createElement('div');

  // Determine color class
  let statusClass = 'green';
  if (item.expiration && /^\d{4}-\d{2}-\d{2}$/.test(item.expiration)) {
    const expDate = new Date(item.expiration);
    const today = new Date();
    if (expDate < today) statusClass = 'red';
    else if (expDate <= new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000)) statusClass = 'yellow';
    else if (expDate > new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)) statusClass = 'green';
    else statusClass = 'yellow';
  }

  div.classList.add('eg', statusClass);
  div.innerHTML = `
    <h3>${item.itemName}</h3>
    <small class="text-muted">Expiration: ${item.expiration || 'N/A'}</small>
  `;
  container.appendChild(div);
});

    })
    .catch(error => console.error('Error fetching Google Sheet data:', error));
});
