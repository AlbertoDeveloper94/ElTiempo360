const weatherMenu = document.getElementById("weatherMenu");
const weatherBanner = document.getElementById("weatherBanner");

function calculateHeightBanner() {
  const viewportHeight = window.innerHeight;
  let heightNav = weatherMenu.offsetHeight;

  weatherBanner.style.height = viewportHeight - heightNav + "px";
}

calculateHeightBanner();
