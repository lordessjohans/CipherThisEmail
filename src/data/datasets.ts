/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IntentDataset } from '../types';

export const USER_INTENT_DATASETS: IntentDataset[] = [
  {
    id: 'ds-enron',
    name: 'Enron Email Dataset',
    description: 'Developed by CALO (Cognitive Assistant that Learns and Organizes), it contains about 500,000 real-world emails from 150 users. It is the premier reference dataset globally for semantic structure, folder categorization, and intent parsing.',
    category: 'Communication Semantics',
    size: '423 MB',
    recordsCount: '517,431 messages',
    license: 'Public Domain / Open Use',
    relevanceToIntent: 'Ideal for training sentiment analyzers, intent classification, and testing cryptographic anonymization overlays.',
    exploreQuery: 'sender:jeff.skilling@enron.com'
  },
  {
    id: 'ds-avocado',
    name: 'Avocado Research Email Corpus',
    description: 'Provided by the Linguistic Data Consortium (LDC), this contains verified, rich transactional and relational email workflows from a defunct Silicon Valley startup with complete metadata headers.',
    category: 'Relational Workflows',
    size: '1.2 GB',
    recordsCount: '279,000 messages',
    license: 'Linguistic Data Consortium (LDC2015T03)',
    relevanceToIntent: 'Permits investigation into corporate scheduling intents, file-sharing protocols, and priority prediction heuristics.',
    exploreQuery: 'category:Business'
  },
  {
    id: 'ds-bc3',
    name: 'BC3: British Columbia Conversation Corpus',
    description: 'An academic research corpus comprising highly dense email threads and conversation chains parsed for summary points, speech acts, and conversational intent classes.',
    category: 'Conversation Summary',
    size: '8.4 MB',
    recordsCount: '40 structured threads',
    license: 'CC BY-NC-SA 3.0',
    relevanceToIntent: 'Superb for evaluating conversational flow models, intent hierarchies, and syntactic thread alignment.',
    exploreQuery: 'type:structured-thread'
  },
  {
    id: 'ds-trec-ent',
    name: 'TREC Enterprise Search Track Corpus (W3C)',
    description: 'A historical corporate subset of web and mailing list communication logs designed for advanced organizational search evaluation from the TREC initiative.',
    category: 'Information Retrieval',
    size: '1.8 GB',
    recordsCount: '1,320,000 pages/emails',
    license: 'NIST Research License Agreement',
    relevanceToIntent: 'Evaluates matching effectiveness on queries where the intent is finding expert personnel or official documents.',
    exploreQuery: 'expert:cryptography'
  },
  {
    id: 'ds-phish-intent',
    name: 'Unified Phishing Intent Corpus (UPIC)',
    description: 'A cybersecurity collective dataset detailing deceptive intents, urgent prompt signals, and spoofing headers designed to train defensive AI filters.',
    category: 'Cybersecurity & Spoilers',
    size: '45 MB',
    recordsCount: '18,500 active attacks',
    license: 'MIT',
    relevanceToIntent: 'Perfect for building client-side safety triggers that flag incoming emails carrying coercive or fraudulent requests.',
    exploreQuery: 'status:flagged'
  }
];
