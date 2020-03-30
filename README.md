# Ux State Machine

Ux state machine bridges the gap between user flows and app views. It is based on the article [The (Switch)-Case for State Machines...](https://24ways.org/2018/state-machines-in-user-interfaces/) by David Khourshid. This library expands on those concepts and adds additional functionality.

```javascript
import UxStateMachine from 'ux-state-machine';

const states = {
	'start': {
		on: {'EVENT': 'next_state'}
	},
	'next_state': {}
};

let uxStateMachine = new UxStateMachine(states, 'start');

uxStateMachine.emit('EVENT');

uxStateMachine.getState(); // 'next_state'
```

### State change callback

The State Change Callback is triggered when ever a state is changed. It passed three arguments object containing {data, payload}, then 'newState', and 'oldState'.

```javascript
const states = {
	'start': {
		on: {'EVENT': 'next_state'}
	},
	'next_state': {
		data: {data: 'data'}
	}
};

let uxStateMachine = new UxStateMachine(states, 'start');

let stateChangeCallback = ({data, payload}, newState, oldState) => {
	console.log(newState); // new_state
	console.log(oldState); // start
	console.log(payload);  //  {payload: 'payload'}  
	console.log(data);  // {data: 'data'}
}
let payload = {payload: 'payload'};
uxStateMachine.onStateChange(stateChangeCallback);
uxStateMachine.emit('EVENT', payload);
```

### Enter and leave methods

Enter and leave methods trigger when move between states. The leave method triggers immediately on leaving the current state and the enter method triggers immedately on entering the next state. But occur before the State Change Callback is called.

```javascript
const states = {
	'start': {
		on: {'EVENT': 'next_state'},		
		leave: () => { console.log(`leaving 'start'`) },
	},
	'next_state': {
		enter: () => { console.log(`entering 'next_state`) },
	}
};

let uxStateMachine = new UxStateMachine(states, 'start');
uxStateMachine.emit('EVENT');
```

### Code examples

In this example you can see the UxStateMachine in use. On entering the 'enter' function is called on the 'start' state. The attaches a listener to the form and listens for a submit event. On submitting the form it check if the input contains a valid email. If the input does contain a valid email it proceeds to the loading state. If the loading state is successful it emits 'SUCCESS' in then passes on to the complete state, and the complete state removes the event listener from the form. If at any point an error occurs it moves to the 'error' state which passes an error message to the errorNode and stays in that state until the error is resolve.

 [Working Codepen Example](https://codepen.io/adrianjonmiller/details/YzXRBKo)

```html
<form id="form">
	<input id="input" type="email">
	<input type="submit" value="Submit">
</form>
<p id="errorNode"></p>
```

```javascript
const form = document.getElementById('form');
const errorNode = document.getElementById('errorNode');
const input = document.getElementById('input');

const states = {
	'start': {
		on: {
			'ERROR': 'error',
			'SUBMIT': 'loading'
		},
		enter: () => {
			form.addEventListener('submit', submitHandler)
		}
	},
	'error': {
		on: {
			'SUBMIT': 'loading',
			'ERROR': 'error',
		},
		enter: () => {		
			errorNode.innerHTML = 'Sorry there was an error'
		},
		leave: () => { 
			errorNode.innerHTML = ''
		},
	},
	loading: {
		on: {
			'SUCCESS': 'complete',
			'ERROR': 'error'
		},
		enter: ({emit}) => {
			errorNode.innerHTML = 'Loading...'
			setTimeout(() => {
        			emit('SUCCESS')
      			}, 2000);
		}
	},
	complete: {
		enter: () => {
      			errorNode.innerHTML = 'Success';
      			input.value = '';
			form.removeEventListener('submit', submitHandler)
		}
	}
};

const uxStateMachine = new UxStateMachine(states, 'start');

function submitHandler (e) {
	e.preventDefault();
	let email = input.value.match(/[^@]+@[^\.]+\..+/g);
	if (email) {
		uxStateMachine.emit('SUBMIT')
	} else {
		uxStateMachine.emit('ERROR')
	}
}
```
