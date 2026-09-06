const checkIn = document.getElementById("checkIn");
const checkOut = document.getElementById("checkOut");
const nightsEl = document.getElementById("nights");
const totalEl = document.getElementById("totalPrice");
const reserveBtn = document.getElementById("reserveBtn");

// Hidden inputs
const nightsInput = document.getElementById("nightsInput");
const totalInput = document.getElementById("totalInput");

// Get price safely
const price = Number(document.getElementById("listingPrice").value);
console.log("Price:", price);

// Prevent past dates
const today = new Date().toISOString().split("T")[0];
checkIn.min = today;
checkOut.min = today;

function calculatePrice() {

  if (!checkIn.value || !checkOut.value) {
    nightsEl.innerText = "0";
    totalEl.innerText = "0";

    nightsInput.value = "";
    totalInput.value = "";

    reserveBtn.disabled = true;
    return;
  }

  const inDate = new Date(checkIn.value);
  const outDate = new Date(checkOut.value);

  const nights = Math.floor((outDate - inDate) / (1000 * 60 * 60 * 24));

  if (nights <= 0) {
    nightsEl.innerText = "0";
    totalEl.innerText = "0";

    nightsInput.value = "";
    totalInput.value = "";

    reserveBtn.disabled = true;
    return;
  }

  const total = nights * price;

  nightsEl.innerText = nights;
  totalEl.innerText = total;

  // Store values for form submission
  nightsInput.value = nights;
  totalInput.value = total;

  reserveBtn.disabled = false;
}

checkIn.addEventListener("change", calculatePrice);
checkOut.addEventListener("change", calculatePrice);