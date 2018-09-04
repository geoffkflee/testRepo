const puppeteer = require('puppeteer');

( async () => {
	const browser = await puppeteer.launch({headless: false});
	const page = await browser.newPage();
	await page.goto('http://localhost:3000/test.html');

	console.log("Puppeteer start!");

	setupTests();

	async function setupTests()
	{
		console.log("Setting up tests");
		attachHandlers();
		await attachWorkers();
		console.log("Workers attached. Hopefully.");
	}

	function attachHandlers()
	{
		page.on('workercreated', worker => {runTest(worker)});
		page.on('workerdestroyed', worker => console.log('Worker killed: ' + worker.url()));
		page.on('console', msg => {
			  for (let i = 0; i < msg.args().length; ++i)
    			console.log(`${i}: ${msg.args()[i]}`);
		})
	}

	async function attachWorkers()
	{
		return page.addScriptTag({
			content: `
				var worker = new Worker('./workers/worker.js');
			`
		})
	}

	async function runTest(worker)
	{
		console.log('Worker created: ' + worker.url())
		let testResult = await worker.evaluate( () => {return whatIsLife() });
		console.log("Testing yielded: " + testResult);
		await browser.close();
	}

})()