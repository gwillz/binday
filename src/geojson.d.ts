
declare module "*.geojson" {
    import { GeoJsonObject } from "geojson";
    const json: GeoJsonObject;
    export default json;
}
