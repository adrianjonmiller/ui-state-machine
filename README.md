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

The State Change Callback is triggered when ever a state is changed. It passed three arguments 'newState', 'oldState', and the 'payload'.

```javascript
const states = {
	'start': {
		on: {'EVENT': 'next_state'}
	},
	'next_state': {
		payload: {first_name: 'Bob'}
	}
};

let uxStateMachine = new UxStateMachine(states, 'start');

let stateChangeCallback = (newState, oldState, payload) => {
	console.log(newState); // new_state
	console.log(oldState); // start
	console.log(payload);  // {first_name: 'Bob'} 
}

uxStateMachine.onStateChange(stateChangeCallback);
uxStateMachine.emit('EVENT');
```

### Enter and leave methods

Enter and leave methods trigger when move between states. The leave method triggers on leaving the state but before the State Change Callback would be triggered and the enter of the next function triggers immediately before the state change callback triggers.

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

In this example, upon entering the error state, it sets the errorNode content to an error message. On leaving the error state the errorNode content is cleared. [Working Codepen Example](https://codepen.io/adrianjonmiller/details/YzXRBKo)

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
			'SUBMIT': 'submit'
		},
		enter: () => {
			form.addEventListener('submit', submitHandler)
		}
	},
	'error': {
		on: {
			'SUBMIT': 'submit',
			'ERROR': 'error',
		},
		enter: () => {		
			errorNode.innerHTML = 'Sorry there was an error'
		},
		leave: () => { 
			errorNode.innerHTML = ''
		},
	},
	submit: {
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
	let email =	input.value.match(/[^@]+@[^\.]+\..+/g);
	if (email) {
		uxStateMachine.emit('SUBMIT')
	} else {
		uxStateMachine.emit('ERROR')
	}
}
```
