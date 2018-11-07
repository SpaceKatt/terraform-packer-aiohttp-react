'''
Runs the webserver.
'''
# External dependencies
import aiofiles
import asyncio
import boto3

from aiohttp import web

# built-in dependencies
import traceback
import io

from gzip import GzipFile
from urllib.parse import urlparse
from os import path


s3 = boto3.resource('s3')
s3_client = boto3.client('s3')
MY_BUCK = s3.Bucket('example-zzz-data-stoar')
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


@ROUTES.delete('/data')
async def clear_data_handle(req):
    '''
    Tells the malcontent to go root themselves off our lawn.
    '''

    try:
        # TODO: Don't hardcode this
        MY_BUCK.delete_objects(Delete={
                'Objects': [{
                    'Key': 'input.txt'
                }]
            })
    except Exception:
        traceback.print_exc()
        return web.Response(status=500, body="ERROR")

    return web.Response(status=200)


@ROUTES.post('/data')
async def load_data_handle(req):
    '''
    Tells the malcontent to go root themselves off our lawn.
    '''
    # TODO: Don't hardcode this
    url = "https://s3-us-west-2.amazonaws.com/css490/input.txt"
    _, bucket_name, key = urlparse(url).path.split('/', 2)
    obj = s3.Object(
              bucket_name=bucket_name,
              key=key
    )
    # TODO: Don't hardcode this
    MY_BUCK = s3.Bucket('example-zzz-data-stoar')
    MY_BUCK.upload_fileobj(obj.get()["Body"], Key='input.txt')

    buffer = io.BytesIO(obj.get()["Body"].read())
    try:
        got_text = GzipFile(None, 'rb', fileobj=buffer).read()
        print(got_text)
    except OSError:
        buffer.seek(0)
        got_text = buffer.read()
    except Exception:
        traceback.print_exc()
        return web.Response(status=500, body="ERROR")

    save_data_dynamo(got_text)

    return web.Response(status=200)


def save_data_dynamo(data):
    # TODO: Dynamo stuff
    pass


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
