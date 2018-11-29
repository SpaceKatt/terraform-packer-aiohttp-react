'''
Client for DynamoDB
'''
# External dependencies
import boto3
from boto3.dynamodb.conditions import Key


dynamodb = boto3.resource('dynamodb', region_name='us-west-2')
dynamodb_client = boto3.client('dynamodb')


TABLE_NAME = 'Example_Data'


def query_data_dynamo(first_name, last_name):
    table = dynamodb.Table(TABLE_NAME)
    if first_name and last_name:
        scan = table.scan(
            FilterExpression=Key('lastName').eq(last_name)
                           & Key('firstName').eq(first_name),
        )
    elif first_name:
        scan = table.scan(
            FilterExpression=Key('firstName').eq(first_name)
        )
    elif last_name:
        scan = table.scan(
            FilterExpression=Key('lastName').eq(last_name)
        )
    else:
        return None

    if scan['Count']:
        return scan['Items']
    else:
        return None


def clear_data_dynamo():
    table = dynamodb.Table(TABLE_NAME)
    scan = table.scan(
        ProjectionExpression='#k, #s',
        ExpressionAttributeNames={
            '#k': 'lastName',
            '#s': 'firstName'
        }
    )

    with table.batch_writer() as batch:
        for each in scan['Items']:
            batch.delete_item(Key=each)


def create_table(table_name):
    waiter = dynamodb_client.get_waiter('table_not_exists')
    waiter.wait(TableName=table_name)
    print('>>> Creating table in dynamodb')
    table = dynamodb.create_table(
        TableName=table_name,
        KeySchema=[
            {
                'AttributeName': 'lastName',
                'KeyType': 'HASH'
            }, {
                'AttributeName': 'firstName',
                'KeyType': 'RANGE'
            }
        ],
        AttributeDefinitions=[
            {
                'AttributeName': 'lastName',
                'AttributeType': 'S'
            },
            {
                'AttributeName': 'firstName',
                'AttributeType': 'S'
            },

        ],
        ProvisionedThroughput={
            'ReadCapacityUnits': 5,
            'WriteCapacityUnits': 5
        },
        StreamSpecification={
            'StreamEnabled': False
        }
    )


def save_data_dynamo(data):
    lines = data.decode('utf-8').split('\n')
    table = dynamodb.Table(TABLE_NAME)

    for line in lines:
        tokens = line.strip().split(' ')
        key_vals = {}
        key_vals['lastName'] = tokens.pop(0)
        key_vals['firstName'] = tokens.pop(0)

        for token in tokens:
            token = token.split('=')
            if len(token) < 2:
                continue

            key = token[0]
            value = token[1]

            key_vals[key] = value

        table.put_item(TableName='Example_Data', Item=key_vals)


def wait_for_table_exist():
    existing_tables = dynamodb_client.list_tables()['TableNames']
    if TABLE_NAME not in existing_tables:
        create_table(TABLE_NAME)

    waiter = dynamodb_client.get_waiter('table_exists')
    waiter.wait(TableName=TABLE_NAME)
