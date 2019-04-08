'use strict';

const runner = (dataSource, sql, params) => {
  return new Promise((resolved, rejected) => {
    dataSource.connector.query(sql, params, function (err, result) {
      if (err) rejected(err);
      resolved(result);
    })
  }
)};

module.exports = function(Flights) {

  // Flights.goodOnes = async function(date) {
  Flights.goodOnes = async function() {
    const ds = Flights.dataSource;
    const sql = `
    select row_to_json(t) as data
    from (select
      (select array_to_json(array_agg(row_to_json(t))) as the_best_all
      from (
        select *
        from flights
        order by flight_points desc
        limit 3
      ) t),
      (select array_to_json(array_agg(row_to_json(t))) as the_best_all_30
      from (
        select *
        from flights
        where flight_date > (now() - interval '30 days')
        order by flight_points desc
        limit 3
      ) t),
      (select array_to_json(array_agg(row_to_json(t))) as the_best_all_7
      from (
        select *
        from flights
        where flight_date > (now() - interval '7 days')
        order by flight_points desc
        limit 3
      ) t),
      (select array_to_json(array_agg(row_to_json(t))) as the_best_ir
      from (
        select *
        from flights
        where scope like 'IR%'
        order by flight_points desc
        limit 3
      ) t),
      (select array_to_json(array_agg(row_to_json(t))) as the_best_ir_30
      from (
        select *
        from flights
        where scope like 'IR%' and flight_date > (now() - interval '30 days')
        order by flight_points desc
        limit 3
      ) t),
      (select array_to_json(array_agg(row_to_json(t))) as the_best_ir_7
      from (
        select *
        from flights
        where (scope like 'IR%' or site_country = 'IR') and flight_date > (now() - interval '7 days')
        order by flight_points desc
        limit 3
      ) t)
    ) t;
    `;
    // const result = await runner(ds, sql, [date]);
    const result = await runner(ds, sql, []);
    return result[0].data;
  }

  Flights.remoteMethod('goodOnes', {
    accepts: [
      // {arg: 'date', type: 'string', desciption: 'the current date.', http: {source:'query'}},
    ],
    returns: {arg: 'data', type: 'object'},
    desciption: 'With this method you can get the best flights done statisticts.',
    http: {
      verb: 'get',
    },
  });
};
