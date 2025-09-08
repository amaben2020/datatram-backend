import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Request,
  UseGuards,
  BadRequestException,
  UseInterceptors,
} from '@nestjs/common';
import { ConnectionsService } from './connections.service';
import {
  CreateBigQueryConnectionDto,
  CreateConnectionDto,
  UpdateConnectionDto,
} from './dto/create-connection.dto';
import {
  LoggingInterceptor,
  ResponseWrapperInterceptor,
} from 'src/common/interceptors/logging.interceptors';
import { ClerkAuthGuard } from 'src/common/auth/clerk-auth.guard';
import axios from 'axios';
import { promises as fs } from 'fs';

@UseInterceptors(LoggingInterceptor, ResponseWrapperInterceptor)
@UseGuards(ClerkAuthGuard)
@Controller('connections')
export class ConnectionsController {
  constructor(private readonly connectionsService: ConnectionsService) {}

  @Get('/all')
  async findAll(@Request() req: any) {
    const clerkId = req.user?.id || req.user?.sub;

    console.log(clerkId);

    try {
      const data = await this.connectionsService.findAll(clerkId);

      console.log('CALLED ===>', data);

      return data;
    } catch (error) {
      console.log(error);
    }
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Param('destinationId', ParseIntPipe) destinationId: number,
    @Request() req: any,
  ) {
    const userId = req.user?.id || req.user?.sub;
    console.log('userId', userId);
    console.log('destinationId', destinationId);
    return this.connectionsService.findOne(id, destinationId, userId);
  }

  @UseGuards(ClerkAuthGuard)
  @Post()
  async create(
    @Body() createConnectionDto: CreateConnectionDto,
    @Request() req: any,
  ) {
    console.log('req ====>', req?.user);
    console.log('CREATE CONNECTION DTO ===>', createConnectionDto);

    const userId = req.user?.id || req.user?.sub;

    if (!userId) {
      throw new BadRequestException('User authentication required');
    }

    return this.connectionsService.create(createConnectionDto, userId);
  }

  // @UseGuards(ClerkAuthGuard)
  // @Post('connect-to-bigquery')
  // async connectToBigQuery(
  //   @Body() createConnectionDto: CreateBigQueryConnectionDto,
  //   @Request() req: any,
  // ) {
  //   // console.log('req ====>', req?.user);
  //   // console.log('CREATE CONNECTION DTO ===>', createConnectionDto);
  //   const userId = req.user?.id || req.user?.sub;

  //   if (!userId) {
  //     throw new BadRequestException('User authentication required');
  //   }

  //   const connectionData = await this.connectionsService.findOne(
  //     createConnectionDto.connectionId,
  //     createConnectionDto.destinationId,
  //     userId,
  //   );

  //   console.log('connection', connectionData);

  //   // return this.connectionsService.create(createConnectionDto, userId);
  //   // get the source and destination data similar to the createConnextion
  //   // const createConnection = await axios.post(
  //   //   `https://datatram-844630248083.europe-west3.run.app/load_to_bigquery/?target_table_name=datatram-test-table&project_id=coastal-sunspot-463520-p4&dataset_id=databricks_dataset&service_account_content=${connectionData?.serviceJson}`,
  //   // );
  //   // stringify the pdf to match backend format
  //   // make api call to linkBq
  //   // store result in connection history
  // }

  @Post('connect-to-bigquery')
  async connectToBigQuery(
    @Body() createConnectionDto: CreateBigQueryConnectionDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id || req.user?.sub;

    if (!userId) {
      throw new BadRequestException('User authentication required');
    }

    let historyId = null;

    try {
      // Get connection data
      const connectionData = await this.connectionsService.findOne(
        createConnectionDto.connectionId,
        createConnectionDto.destinationId,
        userId,
      );

      if (!connectionData) {
        throw new BadRequestException('Connection not found');
      }

      console.log('connection', connectionData);

      // Create initial history record
      // historyId = await this.createConnectionHistory(
      //   connectionData.destinationId,
      //   'pending',
      //   {
      //     fileName: connectionData.file,
      //     startTime: new Date().toISOString(),
      //   },
      // );

      console.log('connectionData', connectionData);

      // Process file data based on file type
      let processedData: any[] = [];
      if (connectionData.file) {
        // Read the actual file content first
        const filePath = `uploads/${connectionData.file}`; // Adjust path as needed
        const fileBuffer = await fs.readFile(filePath);

        const fileExtension = connectionData.file
          .split('.')
          .pop()
          ?.toLowerCase();

        console.log('fileBuffer', fileBuffer);
        console.log('fileExtension', fileBuffer);

        switch (fileExtension) {
          case 'pdf':
            processedData = await this.processFileData(
              fileBuffer,
              'pdf',
              connectionData.file,
            );
            console.log('PROCESSED DATA', processedData);
            break;
          case 'csv':
            processedData = await this.processFileData(
              fileBuffer,
              'csv',
              connectionData.file,
            );
            break;
          case 'xlsx':
          case 'xls':
            processedData = await this.processFileData(
              fileBuffer,
              'excel',
              connectionData.file,
            );
            break;
          case 'json':
            processedData = await this.processFileData(
              fileBuffer,
              'json',
              connectionData.file,
            );
            break;
          default:
            // Try to process as text or fallback
            processedData = await this.processFileData(
              fileBuffer,
              'text',
              connectionData.file,
            );
        }
      }

      // Prepare API parameters
      const serviceAccountContent = encodeURIComponent(
        JSON.stringify(connectionData.serviceJson),
      );
      const dataContent = encodeURIComponent(JSON.stringify(processedData));

      // Build the API URL
      const apiUrl = `https://datatram-844630248083.europe-west3.run.app/load_to_bigquery/?target_table_name=${connectionData.destinationTableName}&project_id=${connectionData.destinationProjectId}&dataset_id=${connectionData.destinationDatasetId}&service_account_content=${serviceAccountContent}&data=${dataContent}`;

      // Make the API call
      const response = await axios.post(apiUrl);

      // Update connection history with success
      // await this.updateConnectionHistory(historyId, 'success', {
      //   fileName: connectionData.file,
      //   rowsProcessed: processedData.length,
      //   endTime: new Date().toISOString(),
      //   bigQueryResponse: response.data,
      // });

      console.log('processedData', processedData.length);
      console.log(' response.data', response.data);

      return {
        success: true,
        message: 'Data loaded to BigQuery successfully',
        data: response.data,
        // rowsProcessed: processedData.length,
        rowsProcessed: processedData?.length || 0,
      };
    } catch (error) {
      console.error('BigQuery connection error:', error);

      // Update connection history with failure
      // if (historyId) {
      //   await this.updateConnectionHistory(historyId, 'failure', {
      //     error: error.message,
      //     errorStack: error.stack,
      //     endTime: new Date().toISOString(),
      //   });
      // }

      throw new BadRequestException(
        `Failed to connect to BigQuery: ${error.message}`,
      );
    }
  }

  // Helper method to process different file types
  private async processFileData(
    fileBuffer: Buffer,
    fileType: string,
    fileName: string,
  ): Promise<any[]> {
    try {
      // This would be your file processing logic
      switch (fileType) {
        case 'pdf':
          // Use pdf-parse or similar library
          return await this.processPdfFile(fileBuffer, fileName);

        case 'csv':
          // Use csv-parser or papaparse
          return await this.processCsvFile(fileBuffer, fileName);

        case 'excel':
          // Use xlsx library
          return await this.processExcelFile(fileBuffer, fileName);

        case 'json':
          // Parse JSON file
          return await this.processJsonFile(fileBuffer, fileName);

        case 'text':
          // Process as text file
          return await this.processTextFile(fileBuffer, fileName);

        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }
    } catch (error) {
      console.error(`Error processing ${fileType} file:`, error);
      throw new Error(`Failed to process ${fileType} file: ${error.message}`);
    }
  }

  // File processing methods - implement based on your needs
  private async processPdfFile(
    fileBuffer: Buffer,
    fileName: string,
  ): Promise<any[]> {
    // Example using pdf-parse library
    // const pdfParse = require('pdf-parse');
    // const data = await pdfParse(fileBuffer);
    // return this.convertPdfTextToJson(data.text);

    return [{ id: 1, content: 'PDF data', source: fileName }];
  }

  private async processCsvFile(
    fileBuffer: Buffer,
    fileName: string,
  ): Promise<any[]> {
    // Example using papaparse
    // const Papa = require('papaparse');
    // const csvText = fileBuffer.toString('utf8');
    // const result = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    // return result.data;

    return [{ id: 1, content: 'CSV data', source: fileName }];
  }

  private async processExcelFile(
    fileBuffer: Buffer,
    fileName: string,
  ): Promise<any[]> {
    // Example using xlsx library
    // const XLSX = require('xlsx');
    // const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    // const sheetName = workbook.SheetNames[0];
    // const worksheet = workbook.Sheets[sheetName];
    // return XLSX.utils.sheet_to_json(worksheet);

    return [{ id: 1, content: 'Excel data', source: fileName }];
  }

  private async processJsonFile(
    fileBuffer: Buffer,
    fileName: string,
  ): Promise<any[]> {
    try {
      const jsonText = fileBuffer.toString('utf8');
      const jsonData = JSON.parse(jsonText);
      return Array.isArray(jsonData) ? jsonData : [jsonData];
    } catch (error) {
      throw new Error(`Invalid JSON format: ${error.message}`);
    }
  }

  private async processTextFile(
    fileBuffer: Buffer,
    fileName: string,
  ): Promise<any[]> {
    const textContent = fileBuffer.toString('utf8');
    const lines = textContent.split('\n').filter((line) => line.trim());
    return lines.map((line, index) => ({
      id: index + 1,
      content: line.trim(),
      source: fileName,
    }));
  }
}
