
# My Bin Day

Yet another utility for discovering your bin day.
Heavily over-engineered - but it was fun.

Mostly, it was a chance to discover some tech I haven't used before.
In particular,
[Rollup](//rollupjs.org),
[Turf](//turfjs.org),
and [Crank](//crank.js.org).


## Tech
- Typescript
- Rollup.js
- Crank.js
- Express.js
- Turf.js
- date-fns
- markdown-it


## Usage

There are 4 ways to use this library.


### Crank Widget

Example: [Crank Widget](https://my-bin-day.herokuapp.com/examples/widget.html)

Endpoint: `/js/widget.js?map=...&target=...`

- `map` the config name
- `target` the DOM element ID

This renders a widget into your page which then prompts for your GPS location.


### JS Library

Example: [Library](https://my-bin-day.herokuapp.com/examples/lib.html)

Endpoint: `/js/lib.js?map=..."

- `map` the config name

This imports a globally library `Binday` which exposes the methods
for retrieving your bin day/week.

- `Binday.getWeek()` which recycling week is it?
- `Binday.getDay({ latitude, longitude})` what day is my bin collection?


### Static Widget

Example: [Static Widget](https://my-bin-day.herokuapp.com/examples/static.html)

Endpoint: `/widget?map=...&lat=...&lng=...`

- `map` the config name
- `lat` your latitude
- `lng` your longitude

This returns a JS-free HTML copy of the widget.


### REST API

Example: [API](https://my-bin-day.herokuapp.com/examples/api.html)

Endpoint: `/api?map=...&lat=...&lng=...`

- `map` the config name
- `lat` your latitude
- `lng` your longitude

This returns a JSON body of your bin collection data.

```json
{
    "bin_day": "wednesday",
    "bin_week": "green"
}
```


## Creating new maps

This is a config file.

```json
{
    "bin_pattern": ["yellow", "green"],
    "map": { "type": "FeatureCollection", "features": [...] }
}
```


### Config `bin_pattern`

The pattern of bins from week 1 of the current year.

i.e. `['yellow', 'green', 'blue']` should produce:

- Week 1: yellow
- Week 2: green
- Week 3: blue
- Week 4: yellow
- Week 5: green
- etcetera...


### Config `map`

A GeoJSON object in WGS84 coordinates.

This is a simple FeatureCollection with just Polygon or MultiPolygon
children. Most importantly, these should contain a property called `weekday`
that contains whichever day applies to that zone.

Use [geojson.io](geojson.io) to create your own.


## Authors

- [Me](//gwilyn.com)


## License

MIT
