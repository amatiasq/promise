
function deferred() {
	return { promise: 1 };
}

function isPromise(value) {
	return true;
}


deferred.isPromise = isPromise;
module.exports = deferred;
