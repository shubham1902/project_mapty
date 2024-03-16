'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

let form = document.querySelector('.form');
let containerWorkouts = document.querySelector('.workouts');
let inputType = document.querySelector('.form__input--type');
let inputDistance = document.querySelector('.form__input--distance');
let inputDuration = document.querySelector('.form__input--duration');
let inputCadence = document.querySelector('.form__input--cadence');
let inputElevation = document.querySelector('.form__input--elevation');

// let mapEvent, map;

//geolocation api

// navigator.geolocation.getCurrentPosition(function () {
//   alert('Could not get your position');
// });
// // console.log(firt);
// form.addEventListener('submit', function (e) {
//
// Class Structure

class App {
  #map;
  #mapEvent;

  constructor() {
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));
  }
  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('could not get your position');
        }
      );
  }
  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(
      `https://www.google.com/maps/@${latitude},${longitude}
     `
    );
    console.log(this);
    this.#map = L.map('map').setView(
      [position.coords.latitude, position.coords.longitude],
      13
    );
    //arrow function apne parent ke lexical scope ke this ko acces karte hai
    this.#map.on('click', e => {
      this.#mapEvent = e;
      form.classList.remove('hidden');
      inputDistance.focus();
    });
    //console.log(this.#map);
    L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
  }
  _showForm() {}
  _toggleElevationField() {}
  _newWorkout(e) {
    e.preventDefault();
    inputDistance.value = inputDuration.value = inputElevation = '';

    const { lat, lng } = this.#mapEvent.latlng;
    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: 'running-popup',
        }).setContent('Workout')
      )
      .openPopup();
  }
}
const app = new App();
