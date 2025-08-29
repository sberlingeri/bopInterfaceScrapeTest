import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Avatar,
  Chip,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
  Fade,
  Grow,
  Slide,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  InputAdornment,
  Collapse,
} from '@mui/material';
import {
  Send,
  SmartToy,
  Person,
  CheckCircle,
  RadioButtonUnchecked,
  Edit,
  Business,
  LocationOn,
  Policy,
  AttachMoney,
  CalendarToday,
  Email,
  QuestionAnswer,
  Lightbulb,
  AutoAwesome,
} from '@mui/icons-material';
import { useFormContext } from '../contexts/FormContext';

interface ChatMessage {
  id: string;
  type: 'bot' | 'user' | 'quick-action';
  content: string;
  timestamp: Date;
  field?: string;
  value?: any;
  options?: string[];
}

const conversationSteps = [
  {
    field: 'greeting',
    botMessage: "Hi there! I'm here to help you get the best Business Owners Policy for your company. Let's make this quick and easy! What's your email address so I can save your progress?",
    placeholder: "Enter your email address",
    icon: <Email />,
    validation: 'email',
  },
  {
    field: 'effectiveDate',
    botMessage: "Great! When would you like your policy to start? You can choose any date between 14 days ago and 90 days from today.",
    placeholder: "MM/DD/YYYY",
    icon: <CalendarToday />,
    validation: 'date',
  },
  {
    field: 'entityType',
    botMessage: "Perfect! Now, what type of business entity are you insuring?",
    options: ['LLC', 'Corporation', 'Partnership', 'Sole Proprietorship', 'Non-Profit'],
    icon: <Business />,
  },
  {
    field: 'companyName',
    botMessage: "Got it! What's the name of your business?",
    placeholder: "Enter your company name",
    icon: <Business />,
  },
  {
    field: 'address',
    botMessage: "Where is your business located? You can start typing the address and I'll help you find it.",
    placeholder: "Start typing your business address...",
    icon: <LocationOn />,
  },
  {
    field: 'coverage',
    botMessage: "Excellent! Now let's talk coverage. What's your primary concern for insurance?",
    options: ['Property Protection', 'Liability Coverage', 'Both Property & Liability', 'Not Sure - Help Me Decide'],
    icon: <Policy />,
  },
  {
    field: 'revenue',
    botMessage: "To provide accurate pricing, what was your approximate annual revenue last year?",
    options: ['Under $100K', '$100K - $500K', '$500K - $1M', '$1M - $5M', 'Over $5M'],
    icon: <AttachMoney />,
  },
  {
    field: 'confirmation',
    botMessage: "Fantastic! I've gathered all the information I need. Let me create a customized quote for you. Ready to see your options?",
    options: ['Show me my quote', 'Let me review my answers'],
    icon: <CheckCircle />,
  },
];

export const VersionC: React.FC = () => {
  const { formData, saveToLocalStorage } = useFormContext();
  const [localFormData, setLocalFormData] = useState<any>({});
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);

  useEffect(() => {
    // Initialize with greeting
    const initialMessage: ChatMessage = {
      id: '1',
      type: 'bot',
      content: conversationSteps[0].botMessage,
      timestamp: new Date(),
    };
    setMessages([initialMessage]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const timer = setTimeout(() => {
      saveToLocalStorage();
    }, 2000);
    return () => clearTimeout(timer);
  }, [localFormData, saveToLocalStorage]);

  const handleSendMessage = () => {
    if (!userInput.trim()) return;

    const currentStep = conversationSteps[currentStepIndex];
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: userInput,
      timestamp: new Date(),
      field: currentStep.field,
      value: userInput,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsTyping(true);

    // Store the data
    setLocalFormData((prev: any) => ({ ...prev, [currentStep.field]: userInput }));

    // Simulate bot typing and response
    setTimeout(() => {
      setIsTyping(false);
      
      if (currentStepIndex < conversationSteps.length - 1) {
        const nextStep = conversationSteps[currentStepIndex + 1];
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: nextStep.botMessage,
          timestamp: new Date(),
          options: nextStep.options,
        };
        setMessages(prev => [...prev, botMessage]);
        setCurrentStepIndex(prev => prev + 1);
      } else {
        // Final message
        const finalMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: "Perfect! I've prepared your personalized quote. Your Business Owners Policy will provide comprehensive coverage tailored to your needs. Would you like to proceed with the application?",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, finalMessage]);
      }
    }, 1500);
  };

  const handleQuickAction = (option: string) => {
    const currentStep = conversationSteps[currentStepIndex];
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: option,
      timestamp: new Date(),
      field: currentStep.field,
      value: option,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Store the data
    setLocalFormData((prev: any) => ({ ...prev, [currentStep.field]: option }));

    // Simulate bot typing and response
    setTimeout(() => {
      setIsTyping(false);
      
      if (currentStepIndex < conversationSteps.length - 1) {
        const nextStep = conversationSteps[currentStepIndex + 1];
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: nextStep.botMessage,
          timestamp: new Date(),
          options: nextStep.options,
        };
        setMessages(prev => [...prev, botMessage]);
        setCurrentStepIndex(prev => prev + 1);
      }
    }, 1500);
  };

  const handleEditMessage = (messageId: string, newValue: string) => {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex !== -1) {
      const updatedMessages = [...messages];
      updatedMessages[messageIndex].content = newValue;
      setMessages(updatedMessages);
      
      if (updatedMessages[messageIndex].field) {
        setLocalFormData((prev: any) => ({ ...prev, [updatedMessages[messageIndex].field!]: newValue }));
      }
    }
    setEditingMessage(null);
  };

  const progress = ((currentStepIndex + 1) / conversationSteps.length) * 100;

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      py: 3,
    }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Fade in timeout={500}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              mb: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 3,
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar 
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  width: 56,
                  height: 56,
                }}
              >
                <AutoAwesome sx={{ fontSize: 32 }} />
              </Avatar>
              <Box flex={1}>
                <Typography variant="h4" fontWeight="bold">
                  Smart BOP Assistant
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Get your personalized quote in under 2 minutes
                </Typography>
              </Box>
              <Chip
                icon={<Lightbulb />}
                label="AI-Powered"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontWeight: 'bold',
                }}
              />
            </Stack>
            <LinearProgress 
              variant="determinate" 
              value={progress}
              sx={{ 
                mt: 2,
                height: 6,
                borderRadius: 3,
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: 'white',
                  borderRadius: 3,
                }
              }}
            />
          </Paper>
        </Fade>

        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
          {/* Chat Interface */}
          <Grow in timeout={700}>
            <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '70vh' }}>
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
                {/* Messages Area */}
                <Box 
                  sx={{ 
                    flex: 1, 
                    overflowY: 'auto',
                    p: 3,
                    bgcolor: 'grey.50',
                  }}
                >
                  <List sx={{ p: 0 }}>
                    {messages.map((message, index) => (
                      <Slide 
                        key={message.id} 
                        in 
                        direction={message.type === 'bot' ? 'right' : 'left'}
                        timeout={300}
                      >
                        <ListItem 
                          sx={{ 
                            p: 0, 
                            mb: 2,
                            justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                          }}
                        >
                          <Stack 
                            direction="row" 
                            spacing={2}
                            alignItems="flex-start"
                            sx={{ maxWidth: '70%' }}
                          >
                            {message.type === 'bot' && (
                              <Avatar sx={{ bgcolor: 'primary.main', mt: 1 }}>
                                <SmartToy />
                              </Avatar>
                            )}
                            <Box>
                              <Paper
                                elevation={1}
                                sx={{
                                  p: 2,
                                  bgcolor: message.type === 'user' ? 'primary.main' : 'white',
                                  color: message.type === 'user' ? 'white' : 'text.primary',
                                  borderRadius: 2,
                                  borderTopLeftRadius: message.type === 'bot' ? 0 : 16,
                                  borderTopRightRadius: message.type === 'user' ? 0 : 16,
                                }}
                              >
                                {editingMessage === message.id ? (
                                  <TextField
                                    fullWidth
                                    value={message.content}
                                    onChange={(e) => handleEditMessage(message.id, e.target.value)}
                                    onBlur={() => setEditingMessage(null)}
                                    autoFocus
                                    variant="standard"
                                    sx={{ 
                                      '& input': { 
                                        color: message.type === 'user' ? 'white' : 'text.primary' 
                                      }
                                    }}
                                  />
                                ) : (
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <Typography variant="body1">
                                      {message.content}
                                    </Typography>
                                    {message.type === 'user' && (
                                      <IconButton 
                                        size="small"
                                        onClick={() => setEditingMessage(message.id)}
                                        sx={{ color: 'white', opacity: 0.7 }}
                                      >
                                        <Edit fontSize="small" />
                                      </IconButton>
                                    )}
                                  </Stack>
                                )}
                              </Paper>
                              
                              {/* Quick Action Buttons */}
                              {message.options && index === messages.length - 1 && (
                                <Collapse in={showQuickActions}>
                                  <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
                                    {message.options.map((option) => (
                                      <Chip
                                        key={option}
                                        label={option}
                                        onClick={() => handleQuickAction(option)}
                                        sx={{ 
                                          cursor: 'pointer',
                                          '&:hover': { 
                                            bgcolor: 'primary.main',
                                            color: 'white',
                                          }
                                        }}
                                      />
                                    ))}
                                  </Stack>
                                </Collapse>
                              )}
                            </Box>
                            {message.type === 'user' && (
                              <Avatar sx={{ bgcolor: 'secondary.main', mt: 1 }}>
                                <Person />
                              </Avatar>
                            )}
                          </Stack>
                        </ListItem>
                      </Slide>
                    ))}
                    
                    {isTyping && (
                      <Fade in>
                        <ListItem sx={{ p: 0 }}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              <SmartToy />
                            </Avatar>
                            <Paper elevation={1} sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}>
                              <Stack direction="row" spacing={1}>
                                <Box sx={{ 
                                  width: 8, 
                                  height: 8, 
                                  borderRadius: '50%', 
                                  bgcolor: 'grey.400',
                                  animation: 'pulse 1.4s infinite',
                                  animationDelay: '0s',
                                }} />
                                <Box sx={{ 
                                  width: 8, 
                                  height: 8, 
                                  borderRadius: '50%', 
                                  bgcolor: 'grey.400',
                                  animation: 'pulse 1.4s infinite',
                                  animationDelay: '0.2s',
                                }} />
                                <Box sx={{ 
                                  width: 8, 
                                  height: 8, 
                                  borderRadius: '50%', 
                                  bgcolor: 'grey.400',
                                  animation: 'pulse 1.4s infinite',
                                  animationDelay: '0.4s',
                                }} />
                              </Stack>
                            </Paper>
                          </Stack>
                        </ListItem>
                      </Fade>
                    )}
                  </List>
                  <div ref={messagesEndRef} />
                </Box>

                {/* Input Area */}
                <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
                  <Stack direction="row" spacing={2}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder={conversationSteps[currentStepIndex]?.placeholder || "Type your message..."}
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            {conversationSteps[currentStepIndex]?.icon || <QuestionAnswer />}
                          </InputAdornment>
                        ),
                        sx: { borderRadius: 3 }
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleSendMessage}
                      disabled={!userInput.trim()}
                      sx={{ 
                        borderRadius: 3,
                        px: 3,
                      }}
                      endIcon={<Send />}
                    >
                      Send
                    </Button>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grow>

          {/* Side Panel - Progress & Tips */}
          <Grow in timeout={900}>
            <Card sx={{ width: { xs: '100%', lg: 350 } }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Your Progress
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {/* Progress Steps */}
                <List dense>
                  {conversationSteps.map((step, index) => (
                    <ListItem key={step.field}>
                      <ListItemIcon>
                        {index < currentStepIndex ? (
                          <CheckCircle color="success" />
                        ) : index === currentStepIndex ? (
                          <RadioButtonUnchecked color="primary" />
                        ) : (
                          <RadioButtonUnchecked color="disabled" />
                        )}
                      </ListItemIcon>
                      <ListItemText 
                        primary={step.field.charAt(0).toUpperCase() + step.field.slice(1).replace(/([A-Z])/g, ' $1')}
                        primaryTypographyProps={{
                          fontWeight: index === currentStepIndex ? 'bold' : 'normal',
                          color: index <= currentStepIndex ? 'text.primary' : 'text.disabled',
                        }}
                      />
                    </ListItem>
                  ))}
                </List>

                {/* Helpful Tips */}
                <Box sx={{ mt: 4, p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Lightbulb sx={{ color: 'primary.main' }} />
                      <Typography variant="subtitle2" fontWeight="bold">
                        Quick Tips
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      • Your responses are automatically saved
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      • Click on your messages to edit them
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      • Use quick action buttons for faster input
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      • Average completion time: 2 minutes
                    </Typography>
                  </Stack>
                </Box>

                {/* Estimated Quote */}
                {currentStepIndex > 3 && (
                  <Fade in>
                    <Alert severity="success" sx={{ mt: 3 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Estimated Premium Range
                      </Typography>
                      <Typography variant="h5" fontWeight="bold" color="success.main">
                        $125 - $175/month
                      </Typography>
                      <Typography variant="caption">
                        Based on your inputs so far
                      </Typography>
                    </Alert>
                  </Fade>
                )}
              </CardContent>
            </Card>
          </Grow>
        </Stack>
      </Container>

      <style>
        {`
          @keyframes pulse {
            0%, 60%, 100% {
              opacity: 1;
            }
            30% {
              opacity: 0.4;
            }
          }
        `}
      </style>
    </Box>
  );
};