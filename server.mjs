import { BullMonitorExpress } from '@bull-monitor/express'
import Express from 'express'
import Queue from 'bull'

const REDIS_QUEUES  = process.env.REDIS_QUEUES  || ''
const REDIS_HOST    = process.env.REDIS_HOST    || '127.0.0.1'
const REDIS_PORT    = process.env.REDIS_PORT    || 6379
const BULL_PREFIX   = process.env.BULL_PREFIX   || 'bull'
const PORT          = process.env.PORT          || 3000

const queues = REDIS_QUEUES.split(',').map(queue => queue.split(':'))

console.log('Bull Monitor v' + process.env.npm_package_version)
console.log({ REDIS_HOST, REDIS_PORT, REDIS_QUEUES, BULL_PREFIX, queues })

;(async () => {
    const app = Express()

    const monitor = new BullMonitorExpress({
        queues: queues.map(([queue_name, queue_prefix]) => new Queue(queue_name, { redis: { host: REDIS_HOST, port: REDIS_PORT }, prefix: queue_prefix || BULL_PREFIX })),
        gqlPlayground: true,
        gqlIntrospection: true
    })

    await monitor.init()

    app.use('/', monitor.router)

    /* Health check */
    app.use('/ping', (req, res) => res.send('pong'))

    app.listen(PORT)
})()