function searchBuses() {
    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;
    const date = document.getElementById('travel-date').value;
  
    if (!from || !to || !date) {
      alert('Please fill in all fields');
      return;
    }
  
    alert(`Searching buses from ${from} to ${to} on ${date}`);
  }

  fetch('http://localhost:3000/api/bookings', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => res.json())
.then(bookings => {
  const list = document.getElementById('bookings-list');
  list.innerHTML = '';
  bookings.forEach(b => {
    const item = document.createElement('li');
    item.textContent = `Trip to ${b.destination} on ${b.date}`;
    list.appendChild(item);
  });
});