#FC-bar

## Dependencies

* [Bower](https://github.com/bower/bower)

## Setup

First, run `bower install` to make sure you have all the necessary JS libs

Second, run `npm install` to make sure you have all of the dev dependencies to create builds of the site.

## Development

1. Browsers won't load CSVs locally, so you'll need to do a python -m SimpleHTTPServer from the project directory.


## Adding libraries and plugins

1. To install a new package, use: bower install [PACKAGE] --save


Quiz setup workflow
Create Google Spreadsheet from template
Have editor fill in column headers and populate rows
Run GOOGLE APP SERVICE that transforms that spreadsheet into a Google quiz
Get the url of that quiz and put it into the url spots in the formulas for the first three columns (A1, B1, C1)