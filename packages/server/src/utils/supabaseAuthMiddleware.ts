import { Request, Response, NextFunction } from 'express'
import { createClient } from '@supabase/supabase-js'

async function supabaseAuthMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.headers.authorization) {
            return res.status(404).json({
                message: 'The token has not been found.'
            })
        }

        const token = req.headers.authorization.split(' ')[1]

        const supabaseClient = createClient(process.env.SUPABASE_URL ?? '', process.env.SUPABASE_KEY ?? '')
        const { data } = await supabaseClient.auth.getUser(token)

        if (!data.user) {
            return res.status(401).json({ message: 'User has not been authorized.' })
        }

        return next()
    } catch (error: any) {
        return res.status(401).json({ message: 'Credentials error.' })
    }
}

export default supabaseAuthMiddleware
