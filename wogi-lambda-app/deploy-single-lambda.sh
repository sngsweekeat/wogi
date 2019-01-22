FUNC_NAME=$1
FOLDER_NAME=$2

rm $FOLDER_NAME.zip
cd $FOLDER_NAME
npm install

zip -X -r ../$FOLDER_NAME.zip *
cd ..

aws lambda update-function-code --function-name $FUNC_NAME --zip-file fileb://$FOLDER_NAME.zip

