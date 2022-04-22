import type { NextApiRequest, NextApiResponse } from 'next'
import fs from "fs";
import fetch from "node-fetch";
import FormData from 'form-data';
import formidable, { File } from 'formidable';

export const config = {
    api: {
        bodyParser: false,
    }
};

type ProcessedFiles = Array<[string, File]>;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

    let status = 200,
        resultBody = { status: 'ok', message: 'Files were uploaded successfully' };

    /* Get files using formidable */
    const files = await new Promise<ProcessedFiles | undefined>((resolve, reject) => {
        const form = new formidable.IncomingForm();
        const files: ProcessedFiles = [];
        form.on('file', function (field, file) {
            files.push([field, file]);
        })
        form.on('end', () => resolve(files));
        form.on('error', err => reject(err));
        form.parse(req, () => {
            //
        });
    }).catch(e => {
        console.log(e);
        status = 500;
        resultBody = {
            status: 'fail', message: 'Upload error'
        }
    });

    if (files?.length) {

        /* Add files to FormData */
        const formData = new FormData();
        for (const file of files) {
            formData.append(file[0], fs.createReadStream(file[1].filepath));
        }

        /* Send request to another server */
        const response = await fetch('PATH_TO_ANOTHER_SERVER', {
            headers: formData.getHeaders(),
            method: 'POST',
            body: formData
        });

        // Do anything you need with response

    }

    res.status(status).json(resultBody);
}

export default handler;
