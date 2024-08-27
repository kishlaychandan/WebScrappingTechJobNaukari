import puppeteer from 'puppeteer';
import xl from 'excel4node';

const url = 'https://www.naukri.com/it-jobs?src=gnbjobs_homepage_srch';

const wb = new xl.Workbook();
const ws = wb.addWorksheet('Job Postings');

// Function to scrape job postings
async function scrapeJobs() {
    try {
        console.log('Launching browser...');
        // Launch Puppeteer browser
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();

        console.log('Navigating to page...');
        // Go to the URL
        await page.goto(url, { waitUntil: 'networkidle2' });

        console.log('Page loaded');

        // Extract job data
        const jobData = await page.evaluate(() => {
            // const jobTitles = [ 'Job Title', 'Company', 'Location', 'Job Type', 'Posted Date', 'Description' ];
            const jobTitles = Array.from(document.querySelectorAll('.title')).map(el => el.textContent.trim() || 'Not available');
            const locations = Array.from(document.querySelectorAll('.locWdth')).map(el => el.textContent.trim() || 'Not available');
            const companies = Array.from(document.querySelectorAll('.comp-name')).map(el => el.textContent.trim() || 'Not available');
            const jobTypes = Array.from(document.querySelectorAll('.styles_details__Y424J')).map(el => el.textContent.trim() || 'Full time');
            const postedDates = Array.from(document.querySelectorAll('.job-post-day ')).map(el => el.textContent.trim() || 'Not available');
            const descriptions = Array.from(document.querySelectorAll('.job-desc')).map(el => el.textContent.trim() || 'Not available');

            return { jobTitles, companies, locations, jobTypes, postedDates, descriptions };
        });

        console.log('Job Data:', jobData);

        // Close the browser
        await browser.close();
        console.log('Browser closed');

        // Write data to Excel
        ws.cell(1, 1).string('Job Title');
        ws.cell(1, 2).string('Company');
        ws.cell(1, 3).string('Location');
        ws.cell(1, 4).string('Job Type');
        ws.cell(1, 5).string('Posted Date');
        ws.cell(1, 6).string('Description');

        jobData.jobTitles.forEach((title, index) => {
            ws.cell(index + 2, 1).string(title);
            ws.cell(index + 2, 2).string(jobData.companies[index]);
            ws.cell(index + 2, 3).string(jobData.locations[index]);
            ws.cell(index + 2, 4).string(jobData.jobTypes[index]);
            ws.cell(index + 2, 5).string(jobData.postedDates[index]);
            ws.cell(index + 2, 6).string(jobData.descriptions[index]);
        });

        wb.write('tech_job_postings.xlsx');
        console.log('Data successfully scraped and saved to Excel');
    } catch (error) {
        console.error('Error:', error);
    }
}

// Run the scraping function
scrapeJobs();
