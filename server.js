import { BullMonitorExpress } from '@bull-monitor/express'
import Express from 'express'
import Queue from 'bull';

const REDIS_QUEUES  = process.env.REDIS_QUEUES  || ''
const REDIS_HOST    = process.env.REDIS_HOST    || '127.0.0.1'
const REDIS_PORT    = process.env.REDIS_PORT    || 6379
const PORT          = process.env.PORT          || 3000

const queues = REDIS_QUEUES.split(',')

;(async () => {
    const app = Express()

    const monitor = new BullMonitorExpress({
        gqlPlayground: true,
        queues: queues.map(queue_name => new Queue(queue_name, { redis: { host: REDIS_HOST, port: REDIS_PORT } }))
    })

    await monitor.init()

    app.use('/', monitor.router)

    /* Health check */
    app.use('/ping', (req, res) => res.send('pong'))

    app.listen(PORT)
})()