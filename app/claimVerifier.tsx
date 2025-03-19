'use client';

import { ColoredSection } from "@/components/coloredSection";
import { SpinButton } from "@/components/spinButton";
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/popover";
import { Select, SelectItem } from "@nextui-org/select";
import React, { useState } from 'react';
import { AnalysisBox } from './analysisBox';
import { ClaimBox } from './claimBox';
import { ContextBox } from './contextBox';
import { Citation, Claim, VerifyClaimRequest, VerifyClaimResponse } from './types';

interface ExampleTemplates {
  key: string;
  claim: string;
  context: string;
}

const demoExamples: ExampleTemplates[] = [
  {
    key: "Custom",
    claim: "",
    context: ""
  },
  {
    key: "Sports Summarization",
    claim: `Ipswich Town defeated Queens Park Rangers 3-0 in a Championship match. Grant Ward scored the first goal with a shot, followed by Luke Varney's goal after QPR keeper Alex Smithies miscued a clearance. Tom Lawrence sealed the win with a calm finish. Ipswich had several chances to score more, but QPR's defense held strong. The win lifted Ipswich to 14th place, while QPR slipped to 15th. Ipswich manager Mick McCarthy berated his team's performance, while QPR boss Ian Holloway praised his team's mental toughness and defense.`,
    context: `Grant Ward's scuffed shot put Town ahead before Luke Varney rolled the ball into an empty net after QPR keeper Alex Smithies miscued a clearance. Cole Skuse's long-range shot fell to Tom Lawrence, who capped the scoring with a calm finish into the corner. Rangers offered little in attack, but sub Sandro headed Tjarron Cherry's corner against the post late on. Ipswich had failed to score in seven of their previous 10 Championship games, but could have had plenty more, with Christophe Berra heading wide from six yards, and Skuse firing a volley straight at Smithies. The Rs have won only once in their last six matches away from Loftus Road, and rarely looked like improving that record in Ian Holloway's second game in charge. The win lifted Mick McCarthy's Ipswich up four places to 14th and above Rangers, who slipped to 15th. Ipswich manager Mick McCarthy: "The irony was that poor old Alex Smithies cost them the second goal which set us up to win as comprehensively as we did. He then kept it from being an embarrassing scoreline, but I'll take three. "With Luke Varney and also Jonathan Douglas, I knew what I was going to get - even though I bet some people weren't thinking that when they saw the teamsheet. Luke epitomised everything what I want in this team. "We have not been bristling with confidence. I have had a couple of rotten weekends after Rotherham and Nottingham Forest. But hopefully Ipswich can be a happier place than it has been." QPR boss Ian Holloway:  "I am sure everyone will say everything hinged on the second goal, but it shouldn't have. "The goal was a calamity and after that we were awful and it could have been four or five. "Everyone will blame my keeper but I won't as my defenders should have made an angle for him. Even with my legs, I would have ran back and tried to help him. "My players need to be mentally tougher as a group. I am disappointed with how we finished today. We have got to try and be a bigger, braver and more solid team." Match ends, Ipswich Town 3, Queens Park Rangers 0.`,
  },
];

export default function ClaimVerifier() {
  const [claimResponse, setClaimResponse] = useState<VerifyClaimResponse | null>(null);
  const [claimInput, setClaimInput] = useState('');
  const [claimContext, setClaimContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [editView, setEditView] = useState(true);
  const [selectedClaimInd, setSelectedClaimInd] = useState<number>(-1);
  const [visibleCitations, setVisibleCitations] = useState<Citation[]>([]);
  const [selectedCitationId, setSelectedCitationId] = useState<string | undefined>(undefined);
  const [showErrorMessage, setShowErrorMessage] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ExampleTemplates | undefined>(undefined);

  const resetState = () => {
    setClaimResponse(null);
    setSelectedClaimInd(-1)
    setVisibleCitations([]);
    setSelectedCitationId(undefined);
    setShowErrorMessage(false);
  }

  const onExampleTemplateSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const selectedTemplate = demoExamples.find((example) => example.key === value);
    if (selectedTemplate !== undefined) {
      setSelectedTemplate(selectedTemplate);
    }
  };

  const updateSelectedClaim = (claimIndex: number) => {
    if (!claimResponse) {
      return;
    }
    setSelectedClaimInd(claimIndex);
    setSelectedCitationId(undefined);
    if (claimIndex < 0) {
      setVisibleCitations([]);
    }
    else {
      setVisibleCitations(claimResponse?.claims[claimIndex].citationIds.map((citationId) => claimResponse?.citations[citationId]) || []);
    }
  }

  const verifyClaims = (input: string, context: string) => {
    const apiEndpoint = 'https://api.oumi.ai/verifyClaims';
    const data: VerifyClaimRequest = {
      input: input,
      context: context,
    };
    setLoading(true);
    resetState();
    fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'Authorization': 'BEARER bd5784a355bbfd9146c555a70f00accb'
      },
      body: JSON.stringify(data),
    })
      .then((res) => {
        return res.json().then((jsonData) => {
          const parsedResponse: VerifyClaimResponse = {
            claims: [],
            citations: {}
          };
          jsonData.claims.forEach((claim: any) => {
            const newClaim: Claim = {
              startOffset: claim.start_offset,
              endOffset: claim.end_offset,
              citationIds: claim.citation_ids,
              score: claim.score,
              rationale: claim.rationale
            };
            parsedResponse.claims.push(newClaim);
          });
          jsonData.citations.forEach((citation: any) => {
            const newCitation: Citation = {
              startOffset: citation.start_offset,
              endOffset: citation.end_offset,
              id: citation.id
            };
            parsedResponse.citations[citation.id] = newCitation;
          });
          setClaimResponse(parsedResponse);
          setLoading(false);
          setEditView(false);
          return parsedResponse;
        })
      }).catch((err) => {
        setLoading(false);
        setShowErrorMessage(true);
      });
  };

  return (
    <ColoredSection
      colorClass="bg-white"
    >
      <div className="grid grid-cols-[repeat(auto-fit,400px)] justify-center container gap-3 font-inria">
        <div className="column-start-1 col-span-1 xl:col-span-2">
          <Popover
            isOpen={showErrorMessage}
            onClose={() => setShowErrorMessage(false)}
            placement="right"
            showArrow={true}
            backdrop="opaque"
          >
            <PopoverTrigger>
              <div className="inline-block">
                <SpinButton
                  className="justify-self-start"
                  onClick={() => editView ? verifyClaims(claimInput, claimContext) : setEditView(true)}
                  text={editView ? "Verify claims" : "Try another claim"}
                  inProgress={loading}
                />
              </div>
            </PopoverTrigger>
            <PopoverContent>
              <div className="p-2 bg-red-500 text-white rounded-md">
                Whoops, that&apos;s an error! Please try again.
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className=" lg:justify-items-end">
          <div className="">
            <Select
              className="w-[250px]"
              label="Try an example"
              isDisabled={!editView || loading}
              onChange={onExampleTemplateSelection}
              disallowEmptySelection={true}
            >
              {demoExamples.map((example) => (
                <SelectItem key={example.key}>{example.key}</SelectItem>
              ))}
            </Select>
          </div>
        </div>
        <div className="column-start-1 lg:col-span-2 lg:row-start-2 lg:row-span-3">
          <ContextBox
            className="w-full h-[625px]"
            onTextChange={setClaimContext}
            loading={loading}
            citations={visibleCitations}
            editView={editView}
            visibleCitationId={selectedCitationId}
            templateText={selectedTemplate ? selectedTemplate.context : undefined}
          />
        </div>
        <div>
          <ClaimBox
            className="w-[400px] h-[200px]"
            onTextChange={setClaimInput}
            onClaimClick={updateSelectedClaim}
            selectedClaim={selectedClaimInd}
            loading={loading}
            claims={claimResponse ? claimResponse.claims : []}
            editView={editView}
            templateText={selectedTemplate ? selectedTemplate.claim : undefined}
          />
        </div>
        <div>
          <AnalysisBox
            className="w-[400px] h-[413px]"
            loading={loading}
            claimText={claimInput}
            selectedClaim={selectedClaimInd}
            onClaimClick={updateSelectedClaim}
            onCitationClick={setSelectedCitationId}
            claims={claimResponse ? claimResponse.claims : []}
            editView={editView}
          />
        </div>
      </div>
    </ColoredSection>
  )
}
