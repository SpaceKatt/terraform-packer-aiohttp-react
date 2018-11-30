'''
Runs the webserver.
'''
import db.dynamo_client as d_cli

# External dependencies
import aiofiles
import asyncio
import boto3
import json

from aiohttp import web

# built-in dependencies
import traceback
import io

from gzip import GzipFile
from urllib.parse import urlparse
from os import path


s3 = boto3.resource('s3', region_name='us-west-2')
s3_client = boto3.client('s3', region_name='us-west-2')


MY_BUCK = s3.Bucket('example-zzz-data-stoar')
ROUTES = web.RouteTableDef()


TABLE_NAME = d_cli.TABLE_NAME


@ROUTES.get('/')
async def root_handle(req):
    '''
    Tells the malcontent to go root themselves off our lawn.
    '''
    try:
        file_path = path.join(path.dirname(path.abspath(__file__)),
                              './static/root.html')
        async with aiofiles.open(file_path, mode='r') as f:
            content = await f.read()
            return web.Response(
                    body=content,
                    headers={
                        'Content-Type': 'text/html'
                    },
            )
    except Exception:
        return web.Response(status=500)


@ROUTES.get('/js/{file}')
async def static_file_handle(req):
    '''
    Tells the malcontent to go root themselves off our lawn.
    '''
    file_path = req.match_info.get('file', None)
    try:
        file_path = path.join(path.dirname(path.abspath(__file__)),
                              './static/{}'.format(file_path))
        async with aiofiles.open(file_path, mode='r') as f:
            content = await f.read()
            return web.Response(
                    body=content,
                    headers={
                        'Content-Type': 'text/javascript'
                    },
            )
    except Exception:
        return web.Response(status=500)


@ROUTES.post('/query')
async def query_data_handle(req):
    '''
    Tells the malcontent to go root themselves off our lawn.
    '''
    data = await req.json()
    first = None
    last = None
    try:
        if 'firstName' in data:
            first = data['firstName']
        if 'lastName' in data:
            last = data['lastName']
        data = d_cli.query_data_dynamo(first, last)
    except Exception:
        traceback.print_exc()
        return web.Response(status=500, body="ERROR")

    if data:
        return web.Response(status=200, body=json.dumps({'Items': data}))
    else:
        return web.Response(status=404)


@ROUTES.delete('/data')
async def clear_data_handle(req):
    '''
    Tells the malcontent to go root themselves off our lawn.
    '''
    return web.Response(status=200, body="Yayyy")


@ROUTES.post('/data')
async def load_data_handle(req):
    '''
    Tells the malcontent to go root themselves off our lawn.
    '''
    return web.Response(status=200)


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
