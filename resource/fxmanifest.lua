version '1.2.3'
author 'Unlimited.wtf'

fx_version 'adamant'
games { 'gta5' }

lua54 'yes'

server_scripts {
    'server/lua/wrapper.lua',
    'server/index.js',
}

client_scripts {
    'client/index.lua'
}

files {
    'hashes.json'
}

dependencies {
    'qb-core'
}
