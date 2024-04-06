'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// let mapEvent, map;

//geolocation api

// navigator.geolocation.getCurrentPosition(function () {
//   alert('Could not get your position');
// });
// // // // console.log(firt);
// form.addEventListener('submit', function (e) {
//
// Class Structure
let form = document.querySelector('.form');
let containerWorkouts = document.querySelector('.workouts');
let inputType = document.querySelector('.form__input--type');
let inputDistance = document.querySelector('.form__input--distance');
let inputDuration = document.querySelector('.form__input--duration');
let inputCadence = document.querySelector('.form__input--cadence');
let inputElevation = document.querySelector('.form__input--elevation');
class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance; // km
    this.duration = duration; // min
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}
class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }
  calcPace() {
    //min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }
  calcSpeed() {
    //km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}
// let run1 = new Running([5, 5], 5, 5, 5);
// let cycling1 = new Cycling([5, 5], 5, 5, 5);
// let run2 = new Running([5, 5], 5, 5, 5);
// // // console.log(run1, cycling1, run2);
class App {
  #map;
  #mapEvent;
  #workouts = [];
  #mapZoomLevel = 13;
  constructor() {
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
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
    // // console.log
    `https://www.google.com/maps/@${latitude},${longitude}
     `;
    // // // // console.log(this);
    this.#map = L.map('map').setView([latitude, longitude], this.#mapZoomLevel);
    //arrow function apne parent ke lexical scope ke this ko acces karte hai

    //  {
    // this.#mapEvent = e;
    // form.classList.remove('hidden');
    // inputDistance.focus();
    // ab isko show form  function mai likh diya });
    //// // // console.log(this.#map);
    L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    this.#map.on('click', this._showForm.bind(this));
    this.#workouts.forEach(work => {
      this._setMarker(work);
    });
  }
  _showForm(e) {
    this.#mapEvent = e;
    form.classList.remove('hidden');
    inputDistance.focus();
    // // // console.log(inputType.value);

    inputType.addEventListener('change', function (e) {
      // // // console.log(this.value);
      inputElevation.closest('div').classList.toggle('form__row--hidden');
      inputCadence.closest('div').classList.toggle('form__row--hidden');
      // // // console.log(inputCadence.closest('ul'));
      // inputElevation
      //   .closest('.form__row')
      //   .classList.toggle('form__row--hidden');
      // inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    });
  }
  _hideForm() {
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';

    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }
  // _toggleElevationField() {
  //   // inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  //   // inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  // }
  _newWorkout(e) {
    e.preventDefault();
    const validInputs = (...inputs) =>
      inputs.every(inp => {
        Number.isFinite(inp);
      });

    // get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    let workout;
    // workout is  running , create a running object
    if (type === 'running') {
      const cadence = +inputCadence.value;
      // check if data is valid
      // // // console.log(validInputs(distance, duration, cadence));
      // if (!validInputs(distance, duration, cadence)) {
      //   return alert('Inputs have to be Positive numbers!');
      // }
      workout = new Running(this.#mapEvent.latlng, distance, duration, cadence);
    }
    // if the daa is cycling , create a cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;

      // if (!validInputs(distance, duration, elevation)) {
      //   return alert('Inputs have to be Positive numbers!');
      // }
      workout = new Cycling(
        this.#mapEvent.latlng,
        distance,
        duration,
        elevation
      );
    }
    //add new obj to workout array
    this.#workouts.push(workout);
    // // // console.log(this.#workouts);
    //reder work out on map as marker
    inputDistance.value =
      inputDuration.value =
      inputElevation.value =
      inputCadence.value =
        '';

    this._renderworkout(workout);
    this._setMarker(workout);
    this._hideForm();
    this._setLocalStorage();
  }
  _setMarker(workout) {
    // // // console.log(workout);
    L.marker([workout.coords.lat, workout.coords.lng])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        }).setContent('Workout')
      )
      .openPopup();
  }

  _renderworkout(workout) {
    let html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
    <h2 class="workout__title">${workout.description}</h2>
    <div class="workout__details">
      <span class="workout__icon">${
        workout.type === 'running' ? '🏃‍♂️' : '🚴'
      }</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>`;
    if (workout.type === 'running') {
      html += `<div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.pace.toFixed(1)}</span>
      <span class="workout__unit">min/km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">🦶🏼</span>
      <span class="workout__value">${workout.cadence}</span>
      <span class="workout__unit">spm</span>
    </div>`;
    }
    if (workout.type === 'cycling') {
      html += `<div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.speed.toFixed(1)}</span>
      <span class="workout__unit">km/h</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⛰</span>
      <span class="workout__value">${workout.elevationGain}</span>
      <span class="workout__unit">m</span>
    </div>`;
    }
    form.insertAdjacentHTML('afterend', html);
  }

  _moveToPopup(e) {
    const workoutEl = e.target.closest('.workout');
    if (!workoutEl) return; // prevent null pointer reference
    const workoutId = workoutEl.dataset.id;
    if (!workoutId) throw new Error('workoutId not found'); // unhandled exception
    const workout = this.#workouts.find(work => work.id === workoutId);
    // // // console.log(workout);
    if (!workout) throw new Error('workout not found'); // unhandled exception
    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: { duration: 1 },
    });
    // { {+____________________const workoutEl = e.target.closest('.workout');
    // // // // // console.log(typeof workoutEl.dataset.id, workoutEl.dataset.id);
    // if (!workoutEl) return;
    // const workoutId = workoutEl.dataset.id;

    // // // // console.log(workoutId);
    // const workout = this.#workouts.find(function (work) {
    //   return work.id === workoutId;
    // });
    // // // // console.log(workout);--------------------------------}
    // this.#map.setView(workout.coords, this.#mapZoomLevel, {
    //   animate: true,
    //   pan: { duration: 1 },
    // });
  }

  _setLocalStorage() {
    if (!this.#workouts) {
      throw new Error('this.#workouts is null or undefined');
    }
    // // // console.log(this.#workouts);
    try {
      localStorage.setItem('workouts', JSON.stringify(this.#workouts));
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error('this.#workouts is not JSON serializable');
      } else {
        throw error;
      }
    }
  }
  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));
    if (!data) return;
    this.#workouts = data;
    // // // console.log(this.#workouts);
    this.#workouts.forEach(work => {
      this._renderworkout(work);
    });
  } //this is a tag

  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}

const app = new App();
app._getLocalStorage();

//event delegation event listener ko parent element ke andar call karna
