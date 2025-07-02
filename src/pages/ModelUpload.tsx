import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { 
  Upload, 
  File, 
  X, 
  CheckCircle, 
  AlertTriangle,
  Info,
  Shield,
  Cpu,
  Database,
  Settings,
  Eye,
  Lock
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';

// Validation schema
const modelUploadSchema = z.object({
  name: z.string()
    .min(3, 'Model name must be at least 3 characters')
    .max(50, 'Model name must be less than 50 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Model name can only contain letters, numbers, spaces, hyphens and underscores'),
  
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),
  
  version: z.string()
    .regex(/^v?\d+\.\d+\.\d+$/, 'Version must be in format v1.0.0 or 1.0.0'),
  
  type: z.enum(['LLM', 'Vision', 'NLP', 'Custom'], {
    required_error: 'Please select a model type',
  }),
  
  framework: z.enum(['PyTorch', 'TensorFlow', 'Transformers', 'Scikit-learn', 'ONNX', 'Custom'], {
    required_error: 'Please select a framework',
  }),
  
  environment: z.enum(['production', 'staging', 'development'], {
    required_error: 'Please select an environment',
  }),
  
  tags: z.string().optional(),
  
  securityLevel: z.enum(['public', 'internal', 'confidential', 'restricted'], {
    required_error: 'Please select a security level',
  }),
  
  enableMonitoring: z.boolean().default(true),
  enableLogging: z.boolean().default(true),
  enableRateLimit: z.boolean().default(false),
  enableContentFilter: z.boolean().default(true),
  
  rateLimit: z.number()
    .min(1, 'Rate limit must be at least 1')
    .max(10000, 'Rate limit cannot exceed 10,000')
    .optional(),
  
  maxFileSize: z.number()
    .min(1, 'Max file size must be at least 1 MB')
    .max(10000, 'Max file size cannot exceed 10 GB')
    .default(100),
  
  allowedFileTypes: z.array(z.string()).min(1, 'Please select at least one file type'),
  
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

type ModelUploadForm = z.infer<typeof modelUploadSchema>;

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

export default function ModelUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const form = useForm<ModelUploadForm>({
    resolver: zodResolver(modelUploadSchema),
    defaultValues: {
      enableMonitoring: true,
      enableLogging: true,
      enableRateLimit: false,
      enableContentFilter: true,
      maxFileSize: 100,
      allowedFileTypes: ['model'],
    },
  });

  const enableRateLimit = form.watch('enableRateLimit');

  const onSubmit = async (data: ModelUploadForm) => {
    console.log('Form submitted:', data);
    setIsUploading(true);
    
    // Simulate upload process
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    setIsUploading(false);
    setUploadProgress(0);
    
    // Show success message or redirect
    alert('Model uploaded successfully!');
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    Array.from(files).forEach(file => {
      const uploadFile: UploadedFile = {
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading',
        progress: 0,
      };
      
      setUploadedFiles(prev => [...prev, uploadFile]);
      
      // Simulate file upload progress
      const interval = setInterval(() => {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.name === file.name && f.status === 'uploading'
              ? { ...f, progress: Math.min(f.progress + 10, 100) }
              : f
          )
        );
      }, 100);
      
      // Complete upload after 1 second
      setTimeout(() => {
        clearInterval(interval);
        setUploadedFiles(prev => 
          prev.map(f => 
            f.name === file.name 
              ? { ...f, status: 'success', progress: 100 }
              : f
          )
        );
      }, 1000);
    });
  };

  const removeFile = (fileName: string) => {
    setUploadedFiles(prev => prev.filter(f => f.name !== fileName));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Upload AI Model
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Upload and configure your AI model for security monitoring
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Form */}
          <div className="lg:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Info className="h-5 w-5 mr-2" />
                      Basic Information
                    </CardTitle>
                    <CardDescription>
                      Provide basic details about your AI model
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Model Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., GPT-4 Security Model" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="version"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Version *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., v1.0.0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the purpose and capabilities of your model..."
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Provide a detailed description of your model's purpose and capabilities
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Model Type *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="LLM">Large Language Model</SelectItem>
                                <SelectItem value="Vision">Computer Vision</SelectItem>
                                <SelectItem value="NLP">Natural Language Processing</SelectItem>
                                <SelectItem value="Custom">Custom Model</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="framework"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Framework *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select framework" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="PyTorch">PyTorch</SelectItem>
                                <SelectItem value="TensorFlow">TensorFlow</SelectItem>
                                <SelectItem value="Transformers">Transformers</SelectItem>
                                <SelectItem value="Scikit-learn">Scikit-learn</SelectItem>
                                <SelectItem value="ONNX">ONNX</SelectItem>
                                <SelectItem value="Custom">Custom</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="environment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Environment *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select environment" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="production">Production</SelectItem>
                                <SelectItem value="staging">Staging</SelectItem>
                                <SelectItem value="development">Development</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., nlp, security, classification (comma-separated)" {...field} />
                          </FormControl>
                          <FormDescription>
                            Add tags to help categorize and search for your model
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Security Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      Security Configuration
                    </CardTitle>
                    <CardDescription>
                      Configure security settings and monitoring options
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="securityLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Security Level *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select security level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="public">Public - Open access</SelectItem>
                              <SelectItem value="internal">Internal - Organization only</SelectItem>
                              <SelectItem value="confidential">Confidential - Restricted access</SelectItem>
                              <SelectItem value="restricted">Restricted - Highest security</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-medium">Monitoring Options</h4>
                        
                        <FormField
                          control={form.control}
                          name="enableMonitoring"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Enable Security Monitoring</FormLabel>
                                <FormDescription>
                                  Monitor model for security threats and anomalies
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="enableLogging"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Enable Request Logging</FormLabel>
                                <FormDescription>
                                  Log all requests and responses for audit purposes
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="enableContentFilter"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Enable Content Filtering</FormLabel>
                                <FormDescription>
                                  Filter malicious or inappropriate content
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium">Rate Limiting</h4>
                        
                        <FormField
                          control={form.control}
                          name="enableRateLimit"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Enable Rate Limiting</FormLabel>
                                <FormDescription>
                                  Limit the number of requests per minute
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        {enableRateLimit && (
                          <FormField
                            control={form.control}
                            name="rateLimit"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Requests per minute</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="100"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* File Upload */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Upload className="h-5 w-5 mr-2" />
                      Model Files
                    </CardTitle>
                    <CardDescription>
                      Upload your model files and supporting documents
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Upload Area */}
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center">
                      <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                      <div className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                        Drag & drop files here, or click to browse
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        Supported formats: .pkl, .pt, .h5, .onnx, .joblib, .zip
                      </div>
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        id="file-upload"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        accept=".pkl,.pt,.h5,.onnx,.joblib,.zip"
                      />
                      <Button type="button" onClick={() => document.getElementById('file-upload')?.click()}>
                        Browse Files
                      </Button>
                    </div>

                    {/* Uploaded Files */}
                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Uploaded Files</h4>
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                            <File className="h-5 w-5 text-slate-400" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium truncate">{file.name}</span>
                                <div className="flex items-center space-x-2">
                                  {file.status === 'success' && (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  )}
                                  {file.status === 'error' && (
                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                  )}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFile(file.name)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-xs text-slate-500">{formatFileSize(file.size)}</span>
                                {file.status === 'uploading' && (
                                  <div className="flex-1 max-w-32">
                                    <Progress value={file.progress} className="h-1" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Notes</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any additional information about the model files..."
                              className="min-h-[80px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Include any special instructions or information about the uploaded files
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline">
                    Save as Draft
                  </Button>
                  <Button type="submit" disabled={isUploading}>
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Model
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upload Progress */}
            {isUploading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Upload Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Progress value={uploadProgress} />
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {uploadProgress}% complete
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Upload Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Upload Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium">File Size</div>
                    <div className="text-slate-600 dark:text-slate-400">Maximum 10GB per file</div>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium">Supported Formats</div>
                    <div className="text-slate-600 dark:text-slate-400">
                      .pkl, .pt, .h5, .onnx, .joblib, .zip
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium">Security Scan</div>
                    <div className="text-slate-600 dark:text-slate-400">
                      All files are automatically scanned for threats
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Alert>
              <Lock className="h-4 w-4" />
              <AlertTitle>Security Notice</AlertTitle>
              <AlertDescription>
                All uploaded models are automatically scanned for vulnerabilities and potential security risks before deployment.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}