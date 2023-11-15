
# My Bin Day

A heavily over-engineered utility for discovering your bin day.

This is build with Typescript + Crank.js. It's funky and fun.


## Abstract

Bin days aren't really that hard. This week it was green, last week was yellow. Wait. Or was it? I already forgot. The kid across the street always puts out the yellow bin which just throws everyone off.

Fine - so this exists now.

Councils will also divide up their territory and _move_ the bin day for different sub-suburbs. So this widget is two things - a configuration of bin patterns and a designation of which day for which location.


## Demo

The demo site here shows my own council bin. It won't mean much to you if you're not actually here. Spoof your geolocation if you can and maybe it'll make more sense.

https://gwillz.github.io/binday


## Usage

This used to be far more complicated, now it's just a widget. You can render this into your own site and do whatever you like with it.

```html
<!-- Load the JS widget lib. -->
<script src="https://gwillz.github.io/binday/index.js"></script>

<!-- Create widgets wherever you like. -->
<div data-binday="path/to/config.json"></div>

<!-- (Optional) If not rending on load, trigger them manually. -->
<script>__binday__.render();</script>
```


## Configurations

This is a config file.

```json
{
    "patterns": {
        "bin.trash": ["red"],
        "bin.recycle": ["yellow", "green"]
    },
    "map": { "type": "FeatureCollection", "features": [...] }
}
```


### Config `patterns`

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

This is a simple FeatureCollection with just Polygon or MultiPolygon children. Most importantly, these should contain properties that match the `patterns` config that contains whichever day applies to that zone + pattern.

For example, this only include show alternating yellow/green on Mondays.

```json
{
    "patterns": {
        "bin.recycle": ["yellow", "green"]
    },
    "map": {
        "type": "FeatureCollection", "features": [{
            "type": "Feature",
            "properties": {
                "bin.recycle": "monday",
            }
        }]
    }
}
```

Use [geojson.io](geojson.io) to create your own.

