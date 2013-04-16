Feature: Basic promise implementation - #then method
	As a software developer.
	I want a tool than allow me to easely handle asinchronous request and it's errors.
	So I can have a cleaner code when working with many asinchronous operations


	Scenario: Resolve a promise
		Given I create a deferred object
		  And I add a success callback
		 When I resolve the promise without value
		 Then I should see "fulfilled" as the promise status
		  And The callback must be called once

	Scenario: Resolve a promise with a value
		Given I create a deferred object
		  And I add a success callback
		  And I resolve the promise with some sample value
		 When The next event loop ticks
		 Then I should see "fulfilled" as the promise status
		  And The callback must be called once
		  And The callback must receive the sample value

	Scenario: Add callbacks to a promise after it's resolved
		Given I create a deferred object
		  And I resolve the promise with some sample value
		  And I add a success callback
		  And The callback is not called
		 When The next event loop ticks
		 Then The callback must be called
		  And The callback must receive the sample value


	Scenario: Reject a promise
		Given I create a deferred object
		  And I add a error callback
		 When I reject the promise without value
		 Then I should see "failed" as the promise status
		  And The callback must be called once

	Scenario: Reject a promise with a value
		Given I create a deferred object
		  And I add a error callback
		  And I reject the promise with some sample value
		 When The next event loop ticks
		 Then I should see "failed" as the promise status
		  And The callback must be called once
		  And The callback must receive the sample value

	Scenario: Add callbacks to a promise after it's rejected
		Given I create a deferred object
		  And I reject the promise with some sample value
		  And I add a error callback
		  And The callback is not called
		 When The next event loop ticks
		 Then The callback must be called
		  And The callback must receive the sample value


	Scenario: Modify a promise value
		Given I create a deferred object
		  And I resolve the promise with some sample value
		  And I add a success listener than returns other value
		 When The next event loop ticks
		 Then The returned promise must be resolved with the value returned by the callback

	Scenario: Fail while handling a promise response
		Given I create a deferred object
		  And I resolve the promise with some sample value
		  And I add a success listener than throws other value
		 When The next event loop ticks
		 Then The returned promise must be rejected with the value throwed by the callback

	Scenario: Resolve a failed promise
		Given I create a deferred object
		  And I reject the promise with some sample value
		  And I add a error listener than returns other value
		 When The next event loop ticks
		 Then The returned promise must be resolved with the value returned by the callback

	Scenario: Fail while handling a failed promise
		Given I create a deferred object
		  And I reject the promise with some sample value
		  And I add a error listener than throws other value
		 When The next event loop ticks
		 Then The returned promise must be rejected with the value throwed by the callback
