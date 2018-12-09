'''
Runs the webserver.
'''
# import db.dynamo_client as d_cli

# External dependencies
import asyncio
import json

import aiohttp
from aiohttp import web

# built-in dependencies
import traceback
import os

from gzip import GzipFile
from urllib.parse import urlparse
from os import path


ROUTES = web.RouteTableDef()


AUTH_CODE = os.environ['AUTH_SIMPLE_IDENT']
IDENTITY_ENDPOINT = os.environ['IDENTITY_ENDPOINT']
DATA_ENDPOINT = os.environ['DATA_ENDPOINT']


@ROUTES.post('/register')
async def register_user_handle(req):
    '''
    Tells the malcontent to go root themselves off our lawn.
    '''
    endpoint = 'http://{}/register'.format(IDENTITY_ENDPOINT)

    try:
        data = await req.json()
    except json.decoder.JSONDecodeError:
        return web.Response(status=400)

    try:
        username = data['username']
        passhash = data['passhash']
    except KeyError:
        return web.Response(status=400)

    if username is False or passhash is False:
        return web.Response(status=400)

    if len(username) > 18:
        return web.Response(status=400)

    if not str.isalnum(username):
        return web.Response(status=400)

    async with aiohttp.ClientSession() as session:
        async with session.post(endpoint, json={
                                                "username": username,
                                                "passhash": passhash,
                                                "auth_code": AUTH_CODE,
                                                }) as resp:

            return web.Response(status=resp.status)


@ROUTES.post('/authenticate')
async def auth_user_handle(req):
    '''
    Tells the malcontent to go root themselves off our lawn.
    '''
    endpoint = 'http://{}/authenticate'.format(IDENTITY_ENDPOINT)

    try:
        data = await req.json()
    except json.decoder.JSONDecodeError:
        return web.Response(status=400)

    try:
        username = data['username']
        passhash = data['passhash']
    except KeyError:
        return web.Response(status=400)

    if username is False or passhash is False:
        return web.Response(status=400)

    async with aiohttp.ClientSession() as session:
        async with session.post(endpoint, json={
                                                "username": username,
                                                "passhash": passhash,
                                                "auth_code": AUTH_CODE,
                                                }) as resp:

            if resp.status != 200:
                return web.Response(status=resp.status)

            resp_data = await resp.json()

            return web.json_response(resp_data)


@ROUTES.post('/fetch')
async def fetch_data_handle(req):
    '''
    Tells the malcontent to go root themselves off our lawn.
    '''
    endpoint = 'http://{}/fetch'.format(DATA_ENDPOINT)

    try:
        data = await req.json()
    except json.decoder.JSONDecodeError:
        return web.Response(status=400)

    try:
        username = data['username']
        passhash = data['passhash']
        count = data['count']
    except KeyError:
        return web.Response(status=400)

    try:
        back = data['back']
    except KeyError:
        back = 0

    if username is False or passhash is False:
        return web.Response(status=400)

    async with aiohttp.ClientSession() as session:
        async with session.post(endpoint, json={
                                                "username": username,
                                                "passhash": passhash,
                                                "auth_code": AUTH_CODE,
                                                "count": count,
                                                "back": back
                                                }) as resp:

            if resp.status != 200:
                return web.Response(status=resp.status)

            resp_data = await resp.json()

            return web.json_response(resp_data)


@ROUTES.post('/data')
async def post_data_handle(req):
    '''
    Tells the malcontent to go root themselves off our lawn.
    '''
    endpoint = 'http://{}/data'.format(DATA_ENDPOINT)

    try:
        data = await req.json()
    except json.decoder.JSONDecodeError:
        return web.Response(status=400)

    try:
        username = data['username']
        passhash = data['passhash']
        msg = data['msg']
    except KeyError:
        return web.Response(status=400)

    if username is False or passhash is False:
        return web.Response(status=400)

    async with aiohttp.ClientSession() as session:
        async with session.post(endpoint, json={
                                                "username": username,
                                                "passhash": passhash,
                                                "auth_code": AUTH_CODE,
                                                "msg": msg
                                                }) as resp:

            return web.Response(status=resp.status)


async def init_app():
    '''
    Initialize the database, then application server
    '''
    app = web.Application()

    app.add_routes(ROUTES)

    return app


LOOP = asyncio.get_event_loop()
APP = LOOP.run_until_complete(init_app())


if __name__ == '__main__':
    web.run_app(APP, host='0.0.0.0:8080')
