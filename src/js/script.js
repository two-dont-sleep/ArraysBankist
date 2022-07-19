'use strict';

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2022-07-15T17:01:17.194Z',
    '2022-07-17T23:36:17.929Z',
    '2022-07-19T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000.0, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',

};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
  movementsDates: [
    '2019-09-02T13:15:33.035Z',
    '2019-09-22T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-11T16:33:06.386Z',
    '2020-04-16T14:43:26.374Z',
    '2020-06-21T11:32:59.371Z',
    '2020-07-22T12:04:01.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const options = {
  hour: 'numeric',
  minute: 'numeric',
  day: 'numeric',
  month: "numeric",
  year: 'numeric'
};

let currentAccount, timer;

/////////////////////////////////////////////////
const findUser = username => accounts.find(acc => acc.username === username);

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = "";
  const movements = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements;
  movements.forEach(((mov, i) => {
    const typeOfOperation = (mov < 0) ? "withdrawal" : "deposit";
    const movDate = new Date(acc.movementsDates[i]);
    const displayDate = getFormattedDate(movDate, acc.locale);
    const formattedMovement = getFormattedCurrency(mov, acc.locale, acc.currency);
    const htmlTempl =
      `<div class="movements__row">
            <div class="movements__type movements__type--${typeOfOperation}">
                ${i + 1} ${typeOfOperation}
            </div>
            <div class="movements__date">${displayDate}</div>
            <div class="movements__value">${formattedMovement}</div>
        </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', htmlTempl);

  }))
}

const createUsernames = function (accounts) {
  accounts.forEach(function (acc) {
      acc.username = acc.owner
        .toLowerCase()
        .split(" ")
        .map(x => x.at(0))
        .join("");
    }
  )
}

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((balance, mov) => balance + mov, 0);
  labelBalance.textContent = `${getFormattedCurrency(acc.balance, acc.locale, acc.currency)}`;
}

const calcDisplaySummary = function (user) {
  const incomes = user.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov);
  labelSumIn.textContent = `${getFormattedCurrency(incomes, user.locale, user.currency)}`

  const out = user.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov);
  labelSumOut.textContent = `${getFormattedCurrency(Math.abs(out), user.locale, user.currency)}`

  const interest = user.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * user.interestRate / 100))
    .filter(interest => interest >= 1)
    .reduce((acc, mov) => acc + mov, 0)
  labelSumInterest.textContent = `${getFormattedCurrency(interest, user.locale, user.currency)}`;
}

const updateInformation = function () {
  displayMovements(currentAccount);
  calcDisplayBalance(currentAccount);
  calcDisplaySummary(currentAccount);
}

const getFormattedDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) => Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  const daysPassed = calcDaysPassed(new Date(), date);
  if (daysPassed === 0) {
    return 'Today';
  }
  if (daysPassed === 1) {
    return 'Yesterday'
  }
  if (daysPassed < 7) {
    return `${daysPassed} days ago`
  }
  return new Intl.DateTimeFormat(locale).format(date)
}

const getFormattedCurrency = function (num, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(num);
}

const startLogOutTimer = function() {
  let timer = 100;
  const tick = function() {
    if (timer===0){
      clearInterval(logoutTimer);
      labelWelcome.textContent = "Log in to get started";
      containerApp.style.opacity = 0;
    }
    const min= String(Math.trunc(timer/60)).padStart(2,'0') ;
    const sec = timer % 60;
    labelTimer.textContent = `${min}:${sec}`;
    timer--;
  }
  tick();
  let logoutTimer = setInterval(tick, 1000)
  return logoutTimer;
}

const restartTimer = function() {
  clearInterval(timer);
  timer = startLogOutTimer();
}
createUsernames(accounts);

btnLogin.addEventListener('click', (e) => {
  e.preventDefault(); // prevent form from submitting

  currentAccount = findUser(inputLoginUsername.value);
  if (currentAccount?.pin === Number(inputLoginPin.value)) {

    if (timer)
      clearInterval(timer);

    labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(" ")[0]}!`;
    updateInformation()
    containerApp.style.opacity = 1;

    const now = new Date();
    labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, options).format(now);

    inputLoginPin.value = inputLoginUsername.value = '';
    inputLoginPin.blur();

    timer = startLogOutTimer();
  }
})

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiver = findUser(inputTransferTo.value);
  inputTransferAmount.value = "";
  inputTransferTo.value = "";
  if (receiver && (amount > 0) && (amount <= currentAccount.balance) && (receiver.owner !== currentAccount.owner)) {
    const transferDate = new Date().toISOString();
    currentAccount.movements.push(-amount);
    currentAccount.movementsDates.push(transferDate);
    receiver.movements.push(amount);
    receiver.movementsDates.push(transferDate);
    updateInformation();

    restartTimer();
  }
})

btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if ((inputCloseUsername.value === currentAccount.username) && (currentAccount.pin === Number(inputClosePin.value))) {
    const userIndex = accounts.findIndex(acc => acc.username === inputCloseUsername.value);
    accounts.splice(userIndex, 1);
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = "";
  inputClosePin.value = "";
})

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const loanAmount = Math.floor(inputLoanAmount.value);
  if (loanAmount > 0 && currentAccount.movements.some(mov => loanAmount * 0.1 <= mov)) {
    setTimeout(() => {
      currentAccount.movements.push(loanAmount);
      currentAccount.movementsDates.push(new Date().toISOString());
      updateInformation();
    },3000);
  }
  inputLoanAmount.value = "";
  restartTimer();
})

let sortState = false;
btnSort.addEventListener('click', (e) => {
  e.preventDefault();
  sortState = !sortState
  displayMovements(currentAccount, sortState);
})

//Jus test function for Array.from() method
labelBalance.addEventListener('click', () => {
  const movementsUI = Array.from(document.querySelectorAll(".movements__value"), el => Number(el.textContent.replace("€", "")));
  console.log(movementsUI);

  //we can also do this and map it separately later
  // const movementsUI2 = [...document.querySelectorAll(".movements__value")]
})
