$(document).ready(() => {
	if (localStorage.access_token) {
		afterLogin();
	} else {
		beforeLogin();
	}
});

const beforeLogin = () => {
	$(".before-login").show();
	$(".after-login").hide();
	$("#main-page-title").text("");
};

const afterLogin = () => {
	$(".before-login").hide();
	$(".after-login").show();
	showAllTodo();
	$("#user-profile-picture").empty();
	$("#user-profile-picture").append(`
		<img src="${localStorage.profile_pic}" width="30"
		height="30" class="d-inline-block align-top" alt=""> Hey ${localStorage.userName}, Welcome back
	`);
};

const hideall = () => {
	$(".before-login").hide();
	$(".after-login").hide();
};

// LOGIN AND LOGOUT
const login = (event) => {
	event.preventDefault();
	$("#loginError").remove();
	const email = $("#email").val();
	const password = $("#password").val();
	$.ajax({
		url: "https://api-manga-fancy-todo.herokuapp.com/login",
		method: "POST",
		data: { email, password },
	})
		.done(({ access_token, userName, profile_pic }) => {
			$("registerEmail").val();
			localStorage.access_token = access_token;
			localStorage.userName = userName;
			localStorage.profile_pic = profile_pic;
			$("#loginForm")[0].reset();
			afterLogin();
		})
		.fail(({ responseJSON }) => {
			errHandler(responseJSON);
			beforeLogin();
		});
};

function onSignIn(googleUser) {
	const token = googleUser.getAuthResponse().id_token;

	$.ajax({
		method: "POST",
		url: "https://api-manga-fancy-todo.herokuapp.com/googlesign",
		data: { token },
	})
		.done(({ access_token, userName, profile_pic }) => {
			localStorage.access_token = access_token;
			localStorage.userName = userName;
			localStorage.profile_pic = profile_pic;
			afterLogin();
		})
		.fail((err) => {
			console.log(err);
		});
}

$(document).ready(() => {
	$("#logout").click(() => {
		localStorage.clear();
		signOut();
		beforeLogin();
		$("#user-profile-picture").empty();
	});
});

const signOut = () => {
	var auth2 = gapi.auth2.getAuthInstance();
	auth2.signOut().then(function () {
		console.log("User signed out.");
	});
};

// TO HIDE AND SHOW REGISTER
$(document).ready(() => {
	$("#registerShow").click(() => {
		hideall();
		$("#registerDiv").load("./register.html");
	});
});

const register = (event) => {
	event.preventDefault();
	const userData = {
		email: $("#registerEmail").val(),
		password: $("#registerPassword").val(),
		first_name: $("#first_name").val(),
		last_name: $("#last_name").val(),
		gender: $("input[name='gender']:checked").val(),
	};
	$.ajax({
		url: "https://api-manga-fancy-todo.herokuapp.com/register",
		method: "POST",
		data: userData,
	})
		.done(() => {
			$("#registerForm").remove();
			beforeLogin();
		})
		.fail(({ responseJSON }) => {
			errHandler(responseJSON);
		});
};

const showAllTodo = () => {
	$.ajax({
		url: "https://api-manga-fancy-todo.herokuapp.com/todos",
		method: "GET",
		headers: {
			access_token: localStorage.access_token,
		},
	})
		.done((result) => {
			$("#main-page-title").text("My Manga List");
			$(".row").empty();
			result.forEach((el) => {
				const status = el.status ? "Finished" : "Reading";
				$(".row").append(`
				<div class="card m-1" style="width: 17rem" id="todos-${el.id}">
					<img class="card-img-top" style="height: 20rem" src="${el.img_url}" alt="manga cover ${el.title}" />
					<div class="card-body">
						<h5 class="card-title" style="height: 4rem">${el.title}</h5>
						<p class="card-text" style="height: 12rem">${el.description}</p>
					</div>
					<ul class="list-group list-group-flush">
						<li class="list-group-item">Due Date: ${el.due_date}</li>
						<li class="list-group-item">Status: ${status}</li>
						<li class="list-group-item">Rating: ${el.score}</li>
					</ul>
					<div class="card-body">
						<button class="btn btn-outline-secondary" 
							type="button" onclick="deleteTodo(event, ${el.id})">Delete</button>
						<button class="btn btn-outline-secondary" 
							type="button" onclick="changeStatusTodo(event, ${el.id}, ${el.status})">Change Status</button>
					</div>
				</div>
				`);
			});
		})
		.fail(({ responseJSON }) => {
			errHandler(responseJSON);
		});
};

const deleteTodo = (event, id) => {
	event.preventDefault();
	$.ajax({
		url: `https://api-manga-fancy-todo.herokuapp.com/todos/${id}`,
		method: "DELETE",
		headers: {
			access_token: localStorage.access_token,
		},
	})
		.done(() => {
			showAllTodo();
		})
		.fail(({ responseJSON }) => {
			errHandler(responseJSON);
		});
};

const changeStatusTodo = (event, id, status) => {
	event.preventDefault();
	$.ajax({
		url: `https://api-manga-fancy-todo.herokuapp.com/todos/${id}`,
		method: "PATCH",
		headers: {
			Content_Type: "application/json",
			access_token: localStorage.access_token,
		},
		data: {
			status: status ? false : true,
		},
	})
		.done(() => {
			showAllTodo();
		})
		.fail(({ responseJSON }) => {
			errHandler(responseJSON);
		});
};

const searchManga = (event) => {
	event.preventDefault();
	const title = $("#search-manga").val();

	$.ajax({
		url: "https://api-manga-fancy-todo.herokuapp.com/jikan/search",
		method: "POST",
		headers: {
			access_token: localStorage.access_token,
		},
		data: { title },
	})
		.done((result) => {
			$("#main-page-title").text("Search Result");
			$(".row").empty();
			result.forEach((el, i) => {
				console.log(el);
				$(".row").append(`
				<div class="card m-1" style="width: 17rem">
					<img class="card-img-top" style="height: 20rem" id="img_url-${i}" src="${el.image_url}" alt="manga cover ${el.title}" />
					<div class="card-body">
						<h5 class="card-title" style="height: 4rem" id="title-${i}">${el.title}</h5>
						<p class="card-text" style="height: 12rem" id="synopsis-${i}">${el.synopsis}</p>
					</div>
					<ul class="list-group list-group-flush">
						<li class="list-group-item" >Rating: ${el.score}</li>
						<li class="list-group-item">Status: <br>
							<div class="form-check form-check-inline">
								<input class="form-check-input" type="radio" name="status-${i}" value="true">
								<label class="form-check-label" for="status-${i}">Finished</label>
					  		</div>
					  		<div class="form-check form-check-inline">
								<input class="form-check-input" type="radio" name="status-${i}" value="false">
								<label class="form-check-label" for="status-${i}">Reading</label>
					  		</div>
						</li>
						<li class="list-group-item">Due Date: 
							<input type="date" class="form-control-inline" id="dueDate-${i}">
						</li>
					</ul>
					<div class="card-body">
						<button 
							class="btn btn-outline-secondary" 
							type="button" 
							onclick="addManga(event, ${el.score}, ${i})"
						>
							Add to List
						</button>
					</div>
				</div>
				`);
			});
		})
		.fail(({ responseJSON }) => {
			errHandler(responseJSON);
		});
};

const addManga = (event, score, i) => {
	event.preventDefault();
	$.ajax({
		url: "https://api-manga-fancy-todo.herokuapp.com/todos",
		method: "POST",
		headers: {
			access_token: localStorage.access_token,
		},
		data: {
			title: $(`#title-${i}`).text(),
			description: $(`#synopsis-${i}`).text(),
			img_url: $(`#img_url-${i}`).prop("src"),
			score,
			status: $(`input[name="status-${i}"]:checked`).val(),
			due_date: $(`input[id="dueDate-${i}"]`).val(),
		},
	})
		.done(() => {
			showAllTodo();
		})
		.fail(({ responseJSON }) => {
			errHandler(responseJSON);
		});
};

const errHandler = ({ message }) => {
	$("#error-message").append(`<p class="text-center" style="color: red">${message}</p>`);
	setTimeout(() => {
		$("#error-message").empty();
	}, 3000);
};
