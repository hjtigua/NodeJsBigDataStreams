import { Transform } from "stream";

export class FilterTransform extends Transform {
  constructor(options) {
    super(options);
  }

  _transform(chunk, encoding, callback) {
    const { year, geo_count, ec_count } = chunk;
        const record = {
      year,
      geo_count: parseInt(geo_count),
      ec_count: parseInt(ec_count),
    };
    this.push(record);
    callback();
  }
}
