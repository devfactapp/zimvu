import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zxauwzjeqixmsliayuoo.supabase.co'
const supabaseKey = 'sb_publishable_LMdZNr-_6_939zQ_HGtXhQ_rPLSVPcJ'

export const supabase = createClient(supabaseUrl, supabaseKey)