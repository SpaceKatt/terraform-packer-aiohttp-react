'''
Runs the webserver.
'''
from aiohttp import web
import aiofiles
import asyncio

from os import path


ROUTES = web.RouteTableDef()


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


@ROUTES.get('/static/{file}')
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


@ROUTES.get('/data')
async def load_data_handle(req):
    '''
    Tells the malcontent to go root themselves off our lawn.
    '''
    return web.Response(status=200, body='REEEEE')


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
